use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Set {
    pub owner: Signer,
    #[account(
        mut,
        constraints(counter.authority == *owner.address()) @ MyError::Unauthorized,
        constraints(CounterAccount::seeds(owner.address()).verify_existing(counter.address(), &crate::ID).is_ok())
    )]
    pub counter: Account<CounterAccount>,
}

impl Set {
    #[inline(always)]
    pub fn set(&mut self, value: u64) -> Result<(), ProgramError> {
        self.counter.value = value.into();
        Ok(())
    }
}

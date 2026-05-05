use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Increment {
    pub owner: Signer,
    #[account(
        mut,
        constraints(counter.authority == *owner.address()) @ MyError::Unauthorized,
        constraints(CounterAccount::seeds(owner.address()).verify_existing(counter.address(), &crate::ID).is_ok())
    )]
    pub counter: Account<CounterAccount>,
}

impl Increment {
    #[inline(always)]
    pub fn increment(&mut self) -> Result<(), ProgramError> {
        let value = self.counter.value.checked_add(1).ok_or(MyError::Overflow)?;
        self.counter.value = value.into();
        Ok(())
    }
}

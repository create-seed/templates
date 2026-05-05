use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Decrement {
    pub owner: Signer,
    #[account(
        mut,
        constraints(counter.authority == *owner.address()) @ MyError::Unauthorized,
        constraints(CounterAccount::seeds(owner.address()).verify_existing(counter.address(), &crate::ID).is_ok())
    )]
    pub counter: Account<CounterAccount>,
}

impl Decrement {
    #[inline(always)]
    pub fn decrement(&mut self) -> Result<(), ProgramError> {
        let value = self.counter.value.checked_sub(1).ok_or(MyError::Underflow)?;
        self.counter.value = value.into();
        Ok(())
    }
}

use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Delete {
    #[account(mut)]
    pub owner: Signer,
    #[account(
        mut,
        constraints(counter.authority == *owner.address()) @ MyError::Unauthorized,
        constraints(CounterAccount::seeds(owner.address()).verify_existing(counter.address(), &crate::ID).is_ok()),
        close(dest = owner)
    )]
    pub counter: Account<CounterAccount>,
}

impl Delete {
    #[inline(always)]
    pub fn delete(&self) -> Result<(), ProgramError> {
        Ok(())
    }
}

use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Set<'info> {
    pub owner: &'info Signer,
    #[account(
        mut,
        constraint = counter.authority == *owner.address() @ MyError::Unauthorized,
        seeds = [b"counter", owner],
        bump = counter.bump
    )]
    pub counter: &'info mut Account<CounterAccount>,
}

impl Set<'_> {
    #[inline(always)]
    pub fn set(&mut self, value: u64) -> Result<(), ProgramError> {
        self.counter.value = value.into();
        Ok(())
    }
}

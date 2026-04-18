use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub owner: &'info mut Signer,
    #[account(
        mut,
        constraint = counter.authority == *owner.address() @ MyError::Unauthorized,
        close = owner,
        seeds = [b"counter", owner],
        bump = counter.bump
    )]
    pub counter: &'info mut Account<CounterAccount>,
}

impl Delete<'_> {
    #[inline(always)]
    pub fn delete(&self) -> Result<(), ProgramError> {
        Ok(())
    }
}

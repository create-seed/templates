use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Decrement<'info> {
    pub owner: &'info Signer,
    #[account(
        mut,
        constraint = counter.authority == *owner.address() @ MyError::Unauthorized,
        seeds = [b"counter", owner],
        bump = counter.bump
    )]
    pub counter: &'info mut Account<CounterAccount>,
}

impl Decrement<'_> {
    #[inline(always)]
    pub fn decrement(&mut self) -> Result<(), ProgramError> {
        let value = self.counter.value.checked_sub(1).ok_or(MyError::Underflow)?;
        self.counter.value = value.into();
        Ok(())
    }
}

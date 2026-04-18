use {
    crate::{errors::MyError, state::CounterAccount},
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Increment<'info> {
    pub owner: &'info Signer,
    #[account(
        mut,
        constraint = counter.authority == *owner.address() @ MyError::Unauthorized,
        seeds = [b"counter", owner],
        bump = counter.bump
    )]
    pub counter: &'info mut Account<CounterAccount>,
}

impl Increment<'_> {
    #[inline(always)]
    pub fn increment(&mut self) -> Result<(), ProgramError> {
        let value = self.counter.value.checked_add(1).ok_or(MyError::Overflow)?;
        self.counter.value = value.into();
        Ok(())
    }
}

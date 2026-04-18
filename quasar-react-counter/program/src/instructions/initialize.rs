use {
    crate::state::CounterAccount,
    quasar_lang::prelude::*,
};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: &'info mut Signer,
    #[account(mut, init, payer = owner, seeds = [b"counter", owner], bump)]
    pub counter: &'info mut Account<CounterAccount>,
    #[allow(dead_code)]
    pub system_program: &'info Program<System>,
}

impl Initialize<'_> {
    #[inline(always)]
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<(), ProgramError> {
        self.counter.set_inner(*self.owner.address(), 0, bumps.counter);
        Ok(())
    }
}

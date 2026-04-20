#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

mod events;
mod instructions;
use instructions::*;
mod state;

declare_id!("DRcH8tvGynzEKMAxkSwGqeLHAYqxgJriEMHjypkUhxQp");

#[program]
mod escrow {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn make(ctx: Ctx<Make>, deposit: u64, receive: u64) -> Result<(), ProgramError> {
        ctx.accounts.make_escrow(receive, &ctx.bumps)?;
        ctx.accounts.deposit_tokens(deposit)?;
        ctx.accounts.emit_event(deposit, receive)
    }

    #[instruction(discriminator = 1)]
    pub fn take(ctx: Ctx<Take>) -> Result<(), ProgramError> {
        ctx.accounts.transfer_tokens()?;
        ctx.accounts.withdraw_tokens_and_close(&ctx.bumps)?;
        ctx.accounts.emit_event()
    }

    #[instruction(discriminator = 2)]
    pub fn refund(ctx: Ctx<Refund>) -> Result<(), ProgramError> {
        ctx.accounts.withdraw_tokens_and_close(&ctx.bumps)?;
        ctx.accounts.emit_event()
    }
}

#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

mod errors;
mod instructions;
mod state;
use instructions::*;

declare_id!("GATuS4JvmdJ2ungXgAfmR4ZHFrPt1uZyUBfxicm7M2F1");

#[program]
mod counter {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn initialize(ctx: Ctx<Initialize>) -> Result<(), ProgramError> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    #[instruction(discriminator = 1)]
    pub fn increment(ctx: Ctx<Increment>) -> Result<(), ProgramError> {
        ctx.accounts.increment()
    }

    #[instruction(discriminator = 2)]
    pub fn decrement(ctx: Ctx<Decrement>) -> Result<(), ProgramError> {
        ctx.accounts.decrement()
    }

    #[instruction(discriminator = 3)]
    pub fn set(ctx: Ctx<Set>, value: u64) -> Result<(), ProgramError> {
        ctx.accounts.set(value)
    }

    #[instruction(discriminator = 4)]
    pub fn delete(ctx: Ctx<Delete>) -> Result<(), ProgramError> {
        ctx.accounts.delete()
    }
}

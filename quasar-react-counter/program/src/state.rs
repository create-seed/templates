#![allow(dead_code)]

use quasar_lang::prelude::*;

#[account(discriminator = [1])]
pub struct CounterAccount {
    pub authority: Address,
    pub value: u64,
    pub bump: u8,
}

#![allow(dead_code)]

use quasar_lang::prelude::*;

#[account(discriminator = [1], set_inner)]
#[seeds(b"counter", authority: Address)]
pub struct CounterAccount {
    pub authority: Address,
    pub value: u64,
    pub bump: u8,
}

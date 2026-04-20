use {
    crate::{
        events::MakeEvent,
        state::{Escrow, EscrowInner},
    },
    quasar_lang::prelude::*,
    quasar_spl::{Mint, Token, TokenCpi},
};

#[allow(dead_code)]
#[derive(Accounts)]
pub struct Make {
    #[account(mut)]
    pub maker: Signer,
    #[account(mut, init, payer = maker, seeds = Escrow::seeds(maker), bump)]
    pub escrow: Account<Escrow>,
    pub mint_a: Account<Mint>,
    pub mint_b: Account<Mint>,
    #[account(mut)]
    pub maker_ta_a: Account<Token>,
    #[account(mut, init_if_needed, payer = maker, token::mint = mint_b, token::authority = maker)]
    pub maker_ta_b: Account<Token>,
    #[account(mut, init_if_needed, payer = maker, token::mint = mint_a, token::authority = escrow)]
    pub vault_ta_a: Account<Token>,
    pub rent: Sysvar<Rent>,
    pub token_program: Program<Token>,
    pub system_program: Program<System>,
}

impl Make {
    #[inline(always)]
    pub fn deposit_tokens(&mut self, amount: u64) -> Result<(), ProgramError> {
        self.token_program
            .transfer(&self.maker_ta_a, &self.vault_ta_a, &self.maker, amount)
            .invoke()
    }

    #[inline(always)]
    pub fn emit_event(&self, deposit: u64, receive: u64) -> Result<(), ProgramError> {
        emit!(MakeEvent {
            escrow: *self.escrow.address(),
            maker: *self.maker.address(),
            mint_a: *self.mint_a.address(),
            mint_b: *self.mint_b.address(),
            deposit,
            receive,
        });
        Ok(())
    }

    #[inline(always)]
    pub fn make_escrow(&mut self, receive: u64, bumps: &MakeBumps) -> Result<(), ProgramError> {
        self.escrow.set_inner(EscrowInner {
            maker: *self.maker.address(),
            mint_a: *self.mint_a.address(),
            mint_b: *self.mint_b.address(),
            maker_ta_b: *self.maker_ta_b.address(),
            receive,
            bump: bumps.escrow,
        });
        Ok(())
    }
}

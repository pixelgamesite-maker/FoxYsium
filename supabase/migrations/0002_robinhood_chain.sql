-- FoxBank moved to Robinhood Chain: holder rewards are paid in ETH, not HYPE.
-- Safe to run whether or not 0001 already ran with the old values.

alter table public.foundry_launches drop constraint if exists foundry_launches_reward_mode_check;
update public.foundry_launches set reward_mode = 'eth' where reward_mode = 'hype';
alter table public.foundry_launches alter column reward_mode set default 'eth';
alter table public.foundry_launches
  add constraint foundry_launches_reward_mode_check check (reward_mode in ('eth','fox','none'));

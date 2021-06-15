import { BigDecimal } from '@graphprotocol/graph-ts'
/* eslint-disable prefer-const */
import { Stake } from '../types/Factory/Presale'
import { StakeEntity } from '../types/schema'

export function handleStake(event: Stake): void {
  const id = event.params.id.toString()
  let stake = new StakeEntity(id)
  stake.user = event.params.user.toHexString()
  stake.amount = new BigDecimal(event.params.amount)
  stake.holdTimeOption = new BigDecimal(event.params.holdTimeOption)
  stake.stakeTime = new BigDecimal(event.params.stakeTime)
  stake.save()
}

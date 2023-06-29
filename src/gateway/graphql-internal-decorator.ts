/* eslint-disable @typescript-eslint/ban-types */
import { ById } from 'tsds-tools'

const INTERNAL_CLASSES: ById<Function> = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Internal(): ClassDecorator {
  return <TFunction extends Function>(target: TFunction) => {
    INTERNAL_CLASSES[target.name] = target
  }
}

export function isInternalClass<TFunction extends Function>(target: TFunction) {
  return INTERNAL_CLASSES[target.name] !== undefined
}

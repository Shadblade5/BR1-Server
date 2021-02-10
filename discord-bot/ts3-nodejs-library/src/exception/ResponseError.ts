import { QueryErrorMessage } from "../types/ResponseTypes"

export class ResponseError extends Error {

  readonly id: string
  readonly msg: string
  readonly extraMsg?: string
  readonly failedPermid?: number

  constructor(error: QueryErrorMessage, stack: string) {
    super(error.msg)
    if (this.stack) {
      this.stack = [this.stack.split("\n")[0], ...stack.split("\n").slice(1)].join("\n")
    }
    this.id = error.id
    this.msg = error.msg
    this.extraMsg = error.extraMsg
    this.failedPermid = error.failedPermid
    if (this.extraMsg) this.message += `, ${this.extraMsg}`
    if (this.failedPermid) this.message += `, failed on permid ${this.failedPermid}`
  }

  /**
   * returns a string representative of this error
   */
  toString() {
    return this.message
  }

  /**
   * returns a json encodeable object for this error
   */
  toJSON() {
    return {
      id: this.id,
      msg: this.msg,
      extraMsg: this.extraMsg,
      failedPermid: this.failedPermid,
      message: this.message
    }
  }
}
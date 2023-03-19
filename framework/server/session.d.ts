import { ISecretSession } from "domain/Secret";

export interface ISessionStore {
   loadSession(session_id: string | undefined, ip: string): Promise<ISecretSession>
   saveSession(sessionObj: ISecretSession)
}

export interface ISessionHandlers {
   SetKey(key: string, value: any) : void
   GetKey(key: string) : any 
   DelKey(key: string) : void 
   SaveSession() : Promise<string>
}

export function createSessionStoreInRAM(SESSION_DURATION: number) : ISessionStore
export function startSession(session_id: string | undefined, ip: string, sessionStore: ISessionStore) : Promise<ISessionHandlers>


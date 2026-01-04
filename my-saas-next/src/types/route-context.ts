import { UserJwtPayload } from './index'; // Assuming types exists or I will verify location

export interface RouteContext {
    params: Record<string, string>;
    user?: UserJwtPayload; // Injected by auth middleware if present
    quota?: { allowed: boolean; remaining: number }; // Injected by billing middleware
}

export interface IBinder {
    destroy()
    update(dt: number): void
    // excutFunc(funcName: string, ...args): void
}
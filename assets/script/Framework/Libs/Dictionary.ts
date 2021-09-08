export class Dictionary<KT, VT> {
    private keys: Array<KT> = new Array()
    private values: Array<VT> = new Array()

    public setValue(key: KT, value: VT): void {
        let index = this.keys.indexOf(key)
        if (index == -1) {
            this.keys.push(key)
            this.values.push(value)
        } else { this.values[index] = value }
    }

    public getValue(key: KT): VT {
        let index = this.keys.indexOf(key)
        return index == -1 ? null : this.values[index]
    }

    public remove(key: KT) {
        var index = this.keys.indexOf(key, 0)
        if (index > -1) {
            this.keys.splice(index, 1)
            this.values.splice(index, 1)
        }
    }

    public hasKey(key: KT): boolean { return this.keys.indexOf(key) != -1 }
    public getKeys(): KT[] { return this.keys }
    public getValues(): VT[] { return this.values }
    public get count(): number { return this.keys.length }

}
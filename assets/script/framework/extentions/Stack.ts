/** 泛型栈 */
export default class Stack<T> {
    private _array: Array<T> = null!

    constructor() { this._array = new Array() }

    /**
     * 往栈加入新的元素
     *
     * @param element 待加入元素
     */
    push(element: T): boolean {
        if (element == null) { return false }

        this._array?.push(element)
        return true
    }

    /**
    * 返回栈尾部元素，并从栈中移除
    *
    * @returns 取出的元素 或者 undefined(队列中没有元素时)
    */
    pop(): T | undefined {
        return this._array.pop()
    }

    /**
     * 返回栈头部元素，不会从栈中移除
     */
    first(): T | null {
        return this.isEmpty() ? null : this._array[0]
    }

    /**
       * 返回栈尾部元素，不会从栈中移除
       */
    last(): T | null {
        return this.isEmpty() ? null : this._array[this.size() - 1]
    }

    /** get */
    get(index: number): T | null {
        return this.isEmpty() ? null : this._array[index]
    }

    del(index: number) {
        if (!this.isEmpty() && index < this._array.length) {
            this._array.splice(index, 1)
        }
    }

    /**  */
    indexOf(element: T): number {
        return this.isEmpty() ? -1 : this._array.indexOf(element)
    }

    /**
     * 放回当前栈大小
     */
    size(): number {
        return this._array.length
    }

    /**
     * 当前栈是否为空
     */
    isEmpty(): boolean {
        return this.size() === 0
    }

    /**
     * 清空栈，栈清空之后不能再继续使用
     */
    clear() {
        this._array.length = 0
    }


}
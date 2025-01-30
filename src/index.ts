// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface IRunnerItemData
{
    [key: string]: () => void
}

interface IRunnerQueueData
{
    item: any,
    index: number | undefined
}

/**
 *
 *Runner
 *
 *based on: https://github.com/GoodBoyDigital/mini-runner
 *thx!
 *
 *const myRunner = new Runner('update');
 *
 *param = 'update'   - update method has no arguments
 *param = 'update|1' - update method has 1 argument
 *param = 'update|3' - update method has 3 arguments
 * @class Runner
 */
export class Runner
{
    public readonly name: string;

    public dispatch: (...args: Array<any>) => void;

    private readonly _impostor: IRunnerItemData;
    public items: Array<any> = [];

    private readonly _itemsQueue: Array<IRunnerQueueData> = [];
    private readonly _removeQueue: Array<any> = [];
    private _isRunning = false;
    private _isHungry = false;
    private _isDirty = false;

    constructor(name: string)
    {
        const tmp = name.split('|');

        this.name = tmp[0];

        const numArgs = parseInt(tmp[1], 10);

        if (numArgs > 3)
        {
            this.dispatch = this._dispatchX;
        }
        else
        {
            // optimization
            switch (numArgs)
            {
                case 1: this.dispatch = this._dispatch1; break;
                case 2: this.dispatch = this._dispatch2; break;
                case 3: this.dispatch = this._dispatch3; break;

                // no arguments or isNaN
                default: this.dispatch = this._dispatch0;
            }
        }

        this._impostor = { [this.name]: noop };
    }

    private _dispatch0()
    {
        this._isRunning = true;

        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i][this.name]();
        }

        this._isRunning = false;

        if (this._isDirty) this._cleanup();
        if (this._isHungry) this._feed();
    }

    private _dispatch1(arg0: unknown)
    {
        this._isRunning = true;

        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i][this.name](arg0);
        }

        this._isRunning = false;

        if (this._isDirty) this._cleanup();
        if (this._isHungry) this._feed();
    }

    private _dispatch2(arg0: unknown, arg1: unknown)
    {
        this._isRunning = true;

        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i][this.name](arg0, arg1);
        }

        this._isRunning = false;

        if (this._isDirty) this._cleanup();
        if (this._isHungry) this._feed();
    }

    private _dispatch3(arg0: unknown, arg1: unknown, arg2: unknown)
    {
        this._isRunning = true;

        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i][this.name](arg0, arg1, arg2);
        }

        this._isRunning = false;

        if (this._isDirty) this._cleanup();
        if (this._isHungry) this._feed();
    }

    private _dispatchX()
    {
        const args = new Array(arguments.length);

        for (let i = 0; i < args.length; ++i)
        {
            args[i] = arguments[i];
        }

        this._isRunning = true;

        for (let i = 0; i < this.items.length; i++)
        {
            this.items[i][this.name](...args);
        }

        this._isRunning = false;

        if (this._isDirty) this._cleanup();
        if (this._isHungry) this._feed();
    }

    public add(item: unknown, index?: number)
    {
        if (typeof (item as any)[this.name] === 'undefined')
        {
            return;
        }

        if (!this._isRunning)
        {
            this.detach(item);

            if (typeof index === 'undefined')
            {
                this.items.push(item);
            }
            else
            {
                this.items.splice(index, 0, item);
            }
        }
        else
        {
            this._itemsQueue.push({ item, index });
        }
    }

    public detach(item: unknown)
    {
        const index = this.items.indexOf(item);

        if (index === -1)
        {
            return;
        }

        if (!this._isRunning)
        {
            this.items.splice(index, 1);
        }
        else
        {
            this._isDirty = true;
            this.items[index] = this._impostor;
            this._removeQueue.push(item);
        }
    }

    private _cleanup()
    {
        for (let i = this._removeQueue.length - 1; i >= 0; i--)
        {
            this.detach(this._removeQueue[i]);
        }

        this._isDirty = false;
    }

    private _feed()
    {
        for (let i = 0; i < this._itemsQueue.length; i++)
        {
            const queue = this._itemsQueue[i];

            this.add(queue.item, queue.index);
        }

        this._isHungry = false;
    }

    public detachAll()
    {
        this.items.length = 0;
        this._itemsQueue.length = 0;
        this._removeQueue.length = 0;
    }

    public destroy()
    {
        this.detachAll();
    }
}

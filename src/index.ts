// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface IRunnerItemData
{
    [key: string]: ()=> void
}

interface IRunnerQueueData
{
    item: any,
    index: number | undefined
}

/**
 *
 * Runner
 *
 * const myRunner = new Runner('update');
 *
 * param = 'update'   - update method has no arguments
 * param = 'update|1' - update method has 1 argument
 * param = 'update|3' - update method has 3 arguments
 *
 * @export
 * @class Runner
 */
export class Runner
{
    readonly name: string;

    public dispatch: (...args: Array<any>)=> void;

    private impostor: IRunnerItemData;
    public items: Array<any> = [];

    private itemsQueue: Array<IRunnerQueueData> = [];
    private removeQueue: Array<any> = [];
    private isRunning = false;
    private isHungry = false;
    private isDirty = false;

    constructor(name: string)
    {
        const tmp = name.split('|');

        this.name = tmp[0];

        const numArgs = parseInt(tmp[1], 10);

        if (numArgs > 3)
            this.dispatch = this.dispatchX;
        else
        {
            // optimization
            switch (numArgs)
            {
                case 1: this.dispatch = this.dispatch1; break;
                case 2: this.dispatch = this.dispatch2; break;
                case 3: this.dispatch = this.dispatch3; break;

                // no arguments or isNaN
                default: this.dispatch = this.dispatch0;
            }
        }

        this.impostor = { [this.name]: noop };
    }

    private dispatch0()
    {
        this.isRunning = true;

        for (let i = 0; i < this.items.length; i++)
            this.items[i][this.name]();

        this.isRunning = false;

        if (this.isDirty) this.cleanup();
        if (this.isHungry) this.feed();
    }

    private dispatch1(arg0: unknown)
    {
        this.isRunning = true;

        for (let i = 0; i < this.items.length; i++)
            this.items[i][this.name](arg0);

        this.isRunning = false;

        if (this.isDirty) this.cleanup();
        if (this.isHungry) this.feed();
    }

    private dispatch2(arg0: unknown, arg1: unknown)
    {
        this.isRunning = true;

        for (let i = 0; i < this.items.length; i++)
            this.items[i][this.name](arg0, arg1);

        this.isRunning = false;

        if (this.isDirty) this.cleanup();
        if (this.isHungry) this.feed();
    }

    private dispatch3(arg0: unknown, arg1: unknown, arg2: unknown)
    {
        this.isRunning = true;

        for (let i = 0; i < this.items.length; i++)
            this.items[i][this.name](arg0, arg1, arg2);

        this.isRunning = false;

        if (this.isDirty) this.cleanup();
        if (this.isHungry) this.feed();
    }

    private dispatchX()
    {
        const args = new Array(arguments.length);

        for (let i = 0; i < args.length; ++i)
        {
            // eslint-disable-next-line prefer-rest-params
            args[i] = arguments[i];
        }

        this.isRunning = true;

        for (let i = 0; i < this.items.length; i++)
            this.items[i][this.name](...args);

        this.isRunning = false;

        if (this.isDirty) this.cleanup();
        if (this.isHungry) this.feed();
    }

    public add(item: unknown, index?: number)
    {
        if (typeof (item as any)[this.name] === 'undefined')
            return;

        if (!this.isRunning)
        {
            this.detach(item);

            if (typeof index === 'undefined')
                this.items.push(item);
            else
                this.items.splice(index, 0, item);
        }
        else
            this.itemsQueue.push({ item, index });
    }

    public detach(item: unknown)
    {
        const index = this.items.indexOf(item);

        if (index === -1)
            return;

        if (!this.isRunning)
            this.items.splice(index, 1);
        else
        {
            this.isDirty = true;
            this.items[index] = this.impostor;
            this.removeQueue.push(item);
        }
    }

    private cleanup()
    {
        for (let i = this.removeQueue.length - 1; i >= 0; i--)
            this.detach(this.removeQueue[i]);

        this.isDirty = false;
    }

    private feed()
    {
        for (let i = 0; i < this.itemsQueue.length; i++)
        {
            const queue = this.itemsQueue[i];

            this.add(queue.item, queue.index);
        }

        this.isHungry = false;
    }

    public detachAll()
    {
        this.items.length = 0;
        this.itemsQueue.length = 0;
        this.removeQueue.length = 0;
    }

    public destroy()
    {
        this.detachAll();
    }
}

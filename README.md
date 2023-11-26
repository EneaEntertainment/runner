# Runner

Alternative to events / signals.

---
## Installation

```js
npm install --save-dev @enea-entertainment/runner
```

[![NPM](https://nodei.co/npm/@enea-entertainment/runner.png?compact=true)](https://nodei.co/npm/@enea-entertainment/runner/)

---
## Usage example

```js
import { Runner } from '@enea-entertainment/runner';

// Runner has no arguments
// each object subscribed to this Runner will have its update method called on dispatch
this.updateRunner = new Runner('update');

// subscribe someObject1 to updateRunner
this.updateRunner.add(someObject1);

// dispatching updateRunner will call someObject1.update() method
this.updateRunner.dispatch();

// cleanup
this.updateRunner.destroy();

// ---------------------------------------------------------------------

// Runner has 2 arguments, notice number 2 after |
this.positionRunner = new Runner('setPosition|2');

// subscribe someObject2 to positionRunner
this.positionRunner.add(someObject2);

// dispatching positionRunner will call someObject2.setPosition() method with 2 arguments (x, y)
this.positionRunner.dispatch(x, y);

// cleanup
this.positionRunner.destroy();
```

---
## Thank you

- Runner is based on [mini-runner](https://github.com/GoodBoyDigital/mini-runner) by GoodBoyDigital

---
## License

MIT, see [LICENSE](LICENSE) for details.

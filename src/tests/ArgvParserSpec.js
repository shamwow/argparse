import ArgvParser from '../ArgvParser';
import assert from 'assert';

describe('ArgvParser', () => {
    let old;

    beforeEach(() => {
        old = process.argv;
    });

    afterEach(() => {
        process.argv = old;
    });

    it('should properly register command and match input with no infinite', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg, 2]..2 -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, [['a10', 'a11'], ['a12', 'a13']]);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register empty command template and match input ', () => {
        process.argv = ['node', __filename, 'test'];

        const prgm = new ArgvParser();

        prgm.register('<rarg>',
                (rarg, options, flags) => {

            assert.equal(rarg, 'test');
            assert.deepEqual(options, {});
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with optional arg that is not given',
            () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg, 2]..2 -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.equal(oarg, undefined);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with infinite optional arg', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg, 2]... -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, [['a10', 'a11'], ['a12', 'a13'], ['a14', 'a15']]);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with infinite optional arg that is not given', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg, 2]... -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, undefined);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with infinite optional arg that is given once', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg, 2]... -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, [['a10', 'a11']]);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with non tuple infinite optional arg that is given once', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg]... -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, ['a10']);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with non tuple infinite optional arg that is not given', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 [oarg]... -o',
                (rarg, rarg1, rarg2, rarg3, oarg, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(oarg, undefined);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should properly register command and match input with infinite required arg', () => {
        process.argv = ['node', __filename, 'test', '-o', 'dir', 'a1', 'a2', 'a3',
                'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 <rarg4, 2>... -o',
                (rarg, rarg1, rarg2, rarg3, rarg4, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(rarg4, [['a10', 'a11'], ['a12', 'a13'], ['a14', 'a15']]);
            assert.deepEqual(options, {
                o: 'dir'
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });


    it('should properly register command and match input with option that is not given', () => {
        process.argv = ['node', __filename, 'test', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
                'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'];

        const prgm = new ArgvParser();

        prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 <rarg4, 2>... -o',
                (rarg, rarg1, rarg2, rarg3, rarg4, options, flags) => {

            assert.equal(rarg, 'a1');
            assert.deepEqual(rarg1, ['a2', 'a3']);
            assert.deepEqual(rarg2, ['a4', 'a5']);
            assert.deepEqual(rarg3, [['a6', 'a7'], ['a8', 'a9']])
            assert.deepEqual(rarg4, [['a10', 'a11'], ['a12', 'a13'], ['a14', 'a15']]);
            assert.deepEqual(options, {
                o: undefined
            });
            assert.deepEqual(flags, {});
        });

        prgm.parse();
    });

    it('should throw when registering two commands with the same id', () => {
        const prgm = new ArgvParser();

        assert.throws(() => {
            prgm.register('test <rarg> <rarg1, 2> <rarg2>..2 <rarg3, 2>..2 <rarg4, 2>... -o',
                () => {});

            prgm.register('test', () => {});
        }, err => err.message === 'Commands must have unique identifiers.');
    });

    it('should throw when unknown command used', () => {
        process.argv = ['node', __filename, 'hello'];

        const prgm = new ArgvParser();

        assert.throws(() => {
            prgm.register('test', () => {});
            prgm.parse();

        }, err => err.message === 'Unknown command.');
    });
});

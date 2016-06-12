import chai from 'chai';
import { stateFactory } from './factories';
import * as Util from '../src/util';
import { Errors } from '../src/const';

const state = stateFactory();

describe('util method', () => {

    describe('appendError', () => {

        it('should exist', () => {
            chai.assert.isFunction(Util.appendError);
        });

        it('should immutably alter state', () => {
            const newState = Util.appendError(state, '-$1-', 'test');
            chai.assert.notStrictEqual(state, newState);
        });

        it('should add error to history', () => {
            const newState = Util.appendError(state, '-$1-', 'test');
            chai.assert.strictEqual(newState.history.length, state.history.length + 1);
        });

        it('should interpolate the command into error', () => {
            const newState = Util.appendError(state, '-$1-', 'test');
            chai.assert.strictEqual(newState.history[0].value, '-test-');
        });

    });

    describe('extractPath', () => {

        it('should exist', () => {
            chai.assert.isFunction(Util.extractPath);
        });

        it('should append relative path to empty root path', () => {
            const path = Util.extractPath('testPath', '');
            chai.assert.strictEqual(path, 'testPath');
        });

        it('should normalize slashes', () => {
            const path = Util.extractPath('/testPath/', '');
            chai.assert.strictEqual(path, 'testPath');
        });

        it('should append relative path to existing path', () => {
            const path = Util.extractPath('testPath', 'rootPath');
            chai.assert.strictEqual(path, 'rootPath/testPath');
        });

        it('should handle single ../ paths', () => {
            const path = Util.extractPath('../testPath', 'rootPath');
            chai.assert.strictEqual(path, 'testPath');
        });

        it('should handle double ../../ paths', () => {
            const path = Util.extractPath('../../testPath', 'rootPath/childPath');
            chai.assert.strictEqual(path, 'testPath');
        });

        it('should handle .. paths with hidden directories', () => {
            const path = Util.extractPath('../dir1', '.privateDir');
            chai.assert.strictEqual(path, 'dir1');
        });

        it('should handle double ../../ paths with hidden directories', () => {
            const path = Util.extractPath('../../dir1', '.privateDir/childDir');
            chai.assert.strictEqual(path, 'dir1');
        });

    });

    describe('getDirectoryByPath', () => {

        it('should exist', () => {
            chai.assert.isFunction(Util.getDirectoryByPath);
        });

        it('should handle shallow traversal', () => {
            const { dir } = Util.getDirectoryByPath(state.structure, 'dir1');
            chai.assert.strictEqual(dir, state.structure.dir1);
        });

        it('should handle nested traversal', () => {
            const { dir } = Util.getDirectoryByPath(state.structure, 'dir1/childDir');
            chai.assert.strictEqual(dir, state.structure.dir1.childDir);
        });

        it('should handle error if path contains non-directory', () => {
            const path = 'dir1/dir1File';
            const { err } = Util.getDirectoryByPath(state.structure, path);
            chai.assert.strictEqual(err, Errors.NOT_A_DIRECTORY.replace('$1', path));
        });

        it('should handle error if path contains non-directory', () => {
            const path = 'dir1/doesNotExist';
            const { err } = Util.getDirectoryByPath(state.structure, path);
            chai.assert.strictEqual(err, Errors.NO_SUCH_FILE.replace('$1', path));
        });

    });

});

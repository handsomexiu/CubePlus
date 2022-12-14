import 'jest'
import Solver from '../../solver/Solver'
describe('Solver', () => {
    const solver = new Solver();
    const state1 = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
    const state2 = 'DLFLRRFDRDFUUDBRDLUFFDFBLLDBBBBLRRRBLURFULBDULFFRBUDUU';
    const state3 = 'RDLLRLURUFBUUDUDDFBULLFLBDLDRBBLFDUDFDRRUFFRRBBUBBFRFL';

    test('constructor', () => {
        const expected = {
            type: 'undefined',
        };
        const result = solver.constructor()
        expect(typeof result).toBe(expected.type);
    });
    test('init', () => {
        const expected = {
            type: 'undefined',
        };
        const result = solver.init()
        expect(typeof result).toBe(expected.type);
    });
    test('solve', () => {
        const expected = {
            type: 'string',
        };
        const result = solver.solve('A')//这里时invalid cube的那一块
        expect(typeof result).toBe(expected.type);
    });

    test('solve', () => {
        const expected = {
            type: 'string',
        };
        const result = solver.solve(state1)//这样就会进入第二个if
        expect(typeof result).toBe(expected.type);
    });
    //由于代码中的branch太多，有一些覆盖不到


    test('solve', () => {
        const expected = {
            type: 'string',
        };
        const result = solver.solve(state2)//利用scramble功能产生一个新的复杂的状态，再去测试，这样的覆盖率会高很多
        expect(typeof result).toBe(expected.type);
    });

    //  test('solve', () => {
    //     const expected = {
    //         type: 'string',
    //       };
    //      const result =solver.solve(state3)//再来一次
    //      expect(typeof result).toBe(expected.type);
    //  });//没有提升

});




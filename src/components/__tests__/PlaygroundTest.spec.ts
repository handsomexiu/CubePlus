import 'jest'
import "babel-polyfill"

import Vue from "vue";
import { Component, Provide, Ref, Watch } from "vue-property-decorator";
//import Viewport from "../viewport";
import World from "../../cube/world";
//import Setting from "../setting";
import { cube_config, delayedYellowToTop, faceToColor, lblOrderMapping, oppositeMapping, stringToTwistParams, twist_duration, whiteToBottom } from "../../cube/utils";
import { Twist, twister } from "../../cube/twister";
import Interactor from "../../cube/interactor";
import Capturer from "../../cube/capture";
import LBLSolver from "../../cube/lbl";
import Cube from "../../cube/cube";
import {Face,Face1} from "../../cube/utils_internal";
import Solver from "../../solver/Solver";

import Playground from '../../vueapp/playground/index'

describe('Playground', () => {

  const playground = new Playground();

  test('projection', () => {
     //测试样本
     const input_1: string[] = ['U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'F', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'L', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'];
     const input_2: string[] = ['L', 'F', 'U', 'R', 'R', 'B', 'B', 'L', 'R', 'D', 'R', 'F', 'L', 'F', 'B', 'U', 'B', 'L', 'R', 'D', 'F', 'F', 'U', 'F', 'D', 'L', 'L', 'R', 'B', 'F', 'U', 'L', 'U', 'B', 'R', 'D', 'D', 'D', 'U', 'U', 'B', 'D', 'L', 'R', 'B', 'R', 'U', 'B', 'D', 'D', 'L', 'F', 'F', 'U'];
     const input_3: string[] = ['L', 'D', 'R', 'R', 'R', 'R', 'R', 'L', 'F', 'D', 'B', 'U', 'F', 'D', 'L', 'U', 'F', 'U', 'B', 'B', 'L', 'R', 'F', 'D', 'U', 'D', 'L', 'L', 'B', 'F', 'U', 'L', 'R', 'R', 'L', 'R', 'D', 'D', 'D', 'U', 'U', 'U', 'F', 'F', 'B', 'F', 'L', 'B', 'U', 'B', 'B', 'B', 'F', 'D'];

     //构造actual --- 根据当前状态，画出来
     const actual_1: string[] = ['LZJ', 'LZJ', 'LZJ', 'U', 'U', 'U', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'U', 'U', 'U', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'U', 'U', 'U', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'L', 'L', 'L', 'F', 'F', 'F', 'R', 'R', 'R', 'B', 'B', 'B', 'L', 'L', 'L', 'F', 'F', 'F', 'R', 'R', 'R', 'B', 'B', 'B', 'L', 'L', 'L', 'F', 'F', 'F', 'R', 'R', 'R', 'B', 'B', 'B', 'LZJ', 'LZJ', 'LZJ', 'D', 'D', 'D', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'D', 'D', 'D', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'D', 'D', 'D', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ'];
     const actual_2: string[] = ['LZJ', 'LZJ', 'LZJ', 'L', 'F', 'U', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'R', 'R', 'B', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'B', 'L', 'R', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'D', 'D', 'U', 'R', 'D', 'F', 'D', 'R', 'F', 'R', 'U', 'B', 'U', 'B', 'D', 'F', 'U', 'F', 'L', 'F', 'B', 'D', 'D', 'L', 'L', 'R', 'B', 'D', 'L', 'L', 'U', 'B', 'L', 'F', 'F', 'U', 'LZJ', 'LZJ', 'LZJ', 'R', 'B', 'F', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'U', 'L', 'U', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'B', 'R', 'D', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ'];
     const actual_3: string[] = ['LZJ', 'LZJ', 'LZJ', 'L', 'D', 'R', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'R', 'R', 'R', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'R', 'L', 'F', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'D', 'D', 'D', 'B', 'B', 'L', 'D', 'B', 'U', 'F', 'L', 'B', 'U', 'U', 'U', 'R', 'F', 'D', 'F', 'D', 'L', 'U', 'B', 'B', 'F', 'F', 'B', 'U', 'D', 'L', 'U', 'F', 'U', 'B', 'F', 'D', 'LZJ', 'LZJ', 'LZJ', 'L', 'B', 'F', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'U', 'L', 'R', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'R', 'L', 'R', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ', 'LZJ'];

     //得到expected --- 调用函数得到
     playground.project_graph(input_1);
     const expected_1 = playground.color_plane;

     playground.project_graph(input_2);
     const expected_2 = playground.color_plane;

     playground.project_graph(input_3);
     const expected_3 = playground.color_plane;

     expect(actual_1).toStrictEqual(expected_1);
     expect(actual_2).toStrictEqual(expected_2);
     expect(actual_3).toStrictEqual(expected_3);
  });


});
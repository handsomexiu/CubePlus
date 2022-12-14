import Vue from "vue";
import { Component, Provide, Ref, Watch } from "vue-property-decorator";
import Viewport from "../viewport";
import World from "../../cube/world";
import Setting from "../setting";
import { cube_config, delayedYellowToTop, faceToColor, lblOrderMapping, oppositeMapping, stringToTwistParams, twist_duration, whiteToBottom } from "../../cube/utils";
import { Twist, twister } from "../../cube/twister";
import Interactor from "../../cube/interactor";
import Capturer from "../../cube/capture";
import LBLSolver from "../../cube/lbl";
import Cube from "../../cube/cube";
import {Face,Face1} from "../../cube/utils_internal";
import Solver from "../../solver/Solver";


@Component({
    template: require("./index.html"),
    components: {
        viewport: Viewport,
        setting: Setting,
    },
})

export default class Playground extends Vue {
    @Provide("world")
    world = new World();

    @Ref("viewport")
    viewport: Viewport;

    width: number = 0;
    height: number = 0;
    size: number = 0;
    
    //cubestep新属性
    cubestep: string[]=[];

    solution: string[] = [];
    progress: number = 0;

    isPlayerMode: boolean = false;
    isPlaying: boolean = false;
    key: number = 0;
    initState: string[] = [];

    buttonEnable: boolean = true;
    clickTimeThreshold: number = 300;

    interactor: Interactor;

    listd: boolean = false;
    capturer: Capturer = new Capturer();
    demoData = require('./demos.json');
    demoImages: string[] = [];
    demoGridWidth: number = 0;
    demoName: string;
    isDemoMode: boolean = false;
    lblSolver = new LBLSolver();
    showTicks: Boolean | string = false;
    backupState: string[] = [];
    backupState_player: string[] = [];
    backupState_switch: string[] = [];

    cubejs = import(/* webpackPreload: true */ '../../preload/cubejs');
    config = cube_config;

    isSwitch:boolean=false;//新添加的属性
    isTeaching:boolean=false;//新增属性
    isColorMode: boolean = false;//新增属性


    yzhcubeState: string[] = [];
    yzhcubeStatec: string[] = [];
    colort: string[];
    colors: { [key: string]: string };
    color = "R";
    erroryzh="";
    iserror:boolean=false;
    solver: Solver = new Solver();

    //新增
    color_plane: string[] = [];

    constructor() {
        super();
        this.colors = {
            R: "#B71C1C",
            L: "#FF6D00",
            U: "#F0F0F0",
            D: "#FFD600",
            F: "#00A020",
            B: "#0D47A1",
            LZJ: "#FFFFFF",
            core: "#202020",
            gray: "#808080",
            high: "#FF0080",
          };
        this.colort = ["R", "F", "D", "L", "B", "U"];
        this.yzhcubeState=this.world.cube.serialize();
        const yzhstate="????U????????R????????F????????D????????L????????B????";
        this.yzhcubeStatec=yzhstate.split("");
    }

    mounted(): void {
        this.interactor = new Interactor([
            this.viewport.canvasElem,
            document.getElementById("top-flex"),
            document.getElementById("bottom-flex")
        ], this.world.controller.interact);
        for (let i = 0; i < this.demoData.length; i++) {
            this.demoImages.push(this.capturer.generate(this.demoData[i].state));
        }
        this.$nextTick(this.resize);
        this.loop();
    }

    loop(): void {
        requestAnimationFrame(this.loop.bind(this));
        this.viewport.draw();
        this.solver.init();
        this.callback();
    }

    resize(): void {
        this.width = document.documentElement.clientWidth;
        this.height = document.documentElement.clientHeight;
        this.size = Math.ceil(Math.min(this.width / 6, this.height / 12));
        this.demoGridWidth = ~~(Math.min(this.size * 2, this.width / 4) * 100) / 100;
        this.viewport.resize(this.width, this.height - this.size * 3.5);
        if(this.isColorMode) this.viewport.resize(this.width, this.height - this.size * 5);
        this.world.cube.dirty = true;
    }

    scramble(): void {
        this.reset();
        this.world.cube.scramble();
    }

    reset(): void {
        this.world.cube.reset();
        this.initState=this.world.cube.serialize();
    }

    idle(value: number): void {
        twister.twists.push(new Twist(0, Math.PI, twist_duration(cube_config.speed) * value, (value: number) => {
            return Math.abs(value - Math.PI) < 1e-6;
        }));
    }

    async solve(isEntry: boolean = true): Promise<void> {
        if (isEntry) {
            if (!this.isPlayerMode) {
                this.backupState = this.world.cube.serialize();
                this.backupState_player = this.world.cube.serialize();
                this.backupState_switch = this.world.cube.serialize();
            }
            this.initState = this.world.cube.serialize();
        }

        const solverId = cube_config.solverId;
        if (solverId == 0) {
            let solution = [];

            const wtb = whiteToBottom(this.initState);
            const lblState: string[] = [];

            const cube = new Cube();
            cube.restore(this.initState);

            const params = stringToTwistParams[wtb];
            for (const layer of params.layers) {
                cube.table.groups[params.axis][layer].twist(params.angle, true);
            }

            const wtbState = cube.serialize();
            for (const faceState of wtbState) {
                lblState.push(faceToColor[faceState]);
            }

            const result = delayedYellowToTop(wtb);
            const combined = result.combined;
            const delayed = result.delayed;

            solution.push(combined);
            const lblSolution = this.lblSolver.solve(lblState, delayed);
            
            //检查lbl的输出
            console.log(lblSolution);

            for (let i = 0; i < lblSolution.length; i++) {
                const lblOrders = lblSolution[i].split("").filter(Boolean);
                for (const order of lblOrders) {
                    let step = lblOrderMapping[order];
                    if (!step) continue;
                    if (i <= 1) {
                        //修改
                        if (step == "~"){
                            continue;
                        }
                        const params = stringToTwistParams[step];
                        if (params.axis != delayed[0]) {
                            if (step[0] == 'y') {
                                step = oppositeMapping[step];
                            } else if (step.length > 1) {
                                step = oppositeMapping[step[0]].concat(step.substring(1));
                            } else {
                                step = oppositeMapping[step[0]];
                            }
                        }
                    }
                    solution.push(step);
                }
                if (i == 1) {
                    solution.push(delayed);
                }
            }
            solution.push("~");
            solution = solution.filter(Boolean);
            for (let i = 0; i + 1 < solution.length; i++) {
                if (solution[i] == "F" && solution[i + 1] == "F") {
                    solution[i] = "F'";
                    solution[i + 1] = "F'";
                }
            }
            this.solution = solution;

            if (lblSolution.filter(Boolean).length <= 3) {
                this.showTicks = "always";
            } else {
                this.showTicks = false;
            }
            //新增标签
            this.cubestep=[];
            for(const j of this.solution){

                if (j=="~") {     
                    this.showTicks = true;
                    this.cubestep.push('!');
                } else {
                    this.showTicks = false;
                    this.cubestep.push('');
                }
            }
        }
        else if (solverId === 1) {
            const promise = await this.cubejs;
            this.solution = promise.Cube
                .fromString(this.initState)
                .solve()
                .replace(/U2/g, "U U")
                .replace(/D2/g, "D D")
                .replace(/F2/g, "F F")
                .replace(/B2/g, "B B")
                .replace(/L2/g, "L L")
                .replace(/R2/g, "R R")
                .split(' ').
                filter(Boolean);
            this.solution.push("~");
            this.showTicks = "always";
        }

        console.log(this.initState.join(""));
        console.log(this.solution.join(" "));
        this.isPlayerMode = true;
        this.setProgress(0);
        this.idle(0.5);
        this.isPlaying = isEntry;

        this.isTeaching=false;//新增内容
    }

    @Watch("isPlayerMode")
    onPlayerModeChange(): void {
        this.world.controller.lock = this.isPlayerMode;
    }

    @Watch("isPlaying")
    onPlayingChange(): void {
        this.world.controller.disable = this.isPlaying;
    }

    callback(): void {
        if (this.isPlayerMode && this.isPlaying) {
            if (this.progress == this.solution.length) {
                this.isPlaying = false;
            }
            if (this.progress < this.solution.length) {
                if (!twister.isTwisting()) {
                    const params = stringToTwistParams[this.solution[this.progress]];
                    for (const layer of params.layers) {
                        this.world.cube.table.groups[params.axis][layer].twist(params.angle, false);
                    }
                    this.progress++;
                }
            }
        }
    }

    play(): void {
        if (this.progress == this.solution.length) {
            this.setProgress(0);
            this.idle(1.5);
        }
        this.isPlaying = true;
    }

    pause(): void {
        this.isPlaying = false;
    }

    quit(): void {
        this.isPlaying = false;
        this.isPlayerMode = false;
        //this.isColorMode=false;
        if (this.isDemoMode) {
            this.isDemoMode = false;
        }
        this.world.cube.restore(this.backupState);
        //console.log(this.backupState);
    }

    //以下两个函数为新增函数
    switch():void{
        this.pause();

        this.isSwitch= true;
        this.isPlayerMode = false;

        this.backupState_player = this.world.cube.serialize();
        this.world.cube.restore(this.backupState_switch);
    }
    back():void{
        this.isSwitch=false;
        this.isPlayerMode = true;

        this.backupState_switch = this.world.cube.serialize();
        this.world.cube.restore(this.backupState_player);

    }

    setProgress(value: number) {
        this.isPlaying = false;

        /*
        this.world.cube.restore(this.initState);
        for (let i = this.solution.length - 1; i >= value; i--) {
            const params = stringToTwistParams[this.solution[i]];
            for (const layer of params.layers) {
                this.world.cube.table.groups[params.axis][layer].twist(params.angle * -1, true);
            }
        }
        */

        this.world.cube.restore(this.initState);
        for (let i = 0; i < value; i++) {
            const params = stringToTwistParams[this.solution[i]];
            for (const layer of params.layers) {
                this.world.cube.table.groups[params.axis][layer].twist(params.angle, true);
            }
        }

        this.progress = value;
    }
    cancle():void{//针对编辑模块而言
        this.isColorMode=false;
        this.viewport.resize(this.width, this.height - this.size * 3.5);
        this.yzhcubeStatec=this.initState;
        this.initState=this.yzhcubeState;
        this.world.cube.restore(this.initState);
    }
    purpleButton(): void {
        if (this.buttonEnable) {
            this.buttonEnable = false;
            setTimeout(() => {
                this.buttonEnable = true;
            }, this.clickTimeThreshold);
            this.cancle();
        }
    }
    


    greenButton(): void {
        if (this.buttonEnable) {
            this.buttonEnable = false;
            setTimeout(() => {
                this.buttonEnable = true;
            }, this.clickTimeThreshold);

            if (!this.isPlayerMode&&!this.isColorMode) {
                this.scramble();
            } else if (this.isColorMode){
                this.clyzh();
            } else {
                this.play();
            }
            return;
        }
    }

    blueButton(): void {
        if (this.buttonEnable) {
            this.buttonEnable = false;
            setTimeout(() => {
                this.buttonEnable = true;
            }, this.clickTimeThreshold);

            if (!this.isPlayerMode) {
                this.reset();
            } else {
                this.pause();
            }
        }
    }
    solutionyzh = "";
    redButton(): void {
        if (this.buttonEnable) {
            this.buttonEnable = false;
            setTimeout(() => {
                this.buttonEnable = true;
            }, this.clickTimeThreshold);

            if (!this.isPlayerMode) {
                if(this.isColorMode) {
                    this.solutionyzh = this.solver.solve(this.world.cube.serialize().join(""));
                    console.log(this.solutionyzh);
                    if(this.solutionyzh=="great"){
                        this.clallyzh();
                    } else {
                        this.erroryzh=this.solutionyzh;
                        this.iserror=true;
                        return;
                    }
                    
                    
                }
                this.solve();
            } else {
                this.quit();
            }
        }
    }

//新增
    blackButton(): void {
        if (this.buttonEnable) {
            this.buttonEnable = false;
            setTimeout(() => {
                this.buttonEnable = true;
            }, this.clickTimeThreshold);


            if (!this.isSwitch) {
                this.switch();

            } else {
                this.back();
            }
        }
    }

    selectDemo(idx: number): void {
        this.listd = false;
        if (!this.isPlayerMode) {
            this.backupState = this.world.cube.serialize();
        }
        this.isDemoMode = true;
        this.isPlayerMode = true;

        this.isTeaching=true;//新增属性

        this.demoName = this.demoData[idx].name;
        this.initState = this.demoData[idx].state.split("");
        this.solution = this.demoData[idx].solution.split(' ').filter(Boolean);
        this.solution.push("~");
        this.showTicks = "always";
        console.log(this.initState.join(""));
        console.log(this.solution.join(" "));
        this.setProgress(0);
    }

    @Watch("config.solverId")
    onSolverChange(): void {
        if (this.isPlayerMode && !this.isDemoMode) {
            this.solve(false);
        }
    }

    stickers: { [face: string]: { [index: number]: string } | undefined } = {};
    
    get faces(): { [face: string]: number } {
        const ret: { [face: string]: number } = {};
        for (const face of [Face.L, Face.R, Face.D, Face.U, Face.B, Face.F]) {
          const key = Face[face];
          ret[key] = 0;
        }
        for (const c of this.initState) {
          ret[c]++;
        }
        return ret;
    }

    stick(index: number, face: number): void {
        if (index < 0) {
          return;
        }

        this.initState=this.world.cube.serialize();

        //const cubelet = this.world.cube.cubelets[index];
        //face = cubelet.convertFace(face);
        let arr = this.stickers[Face[face]];
        if (arr == undefined) {
          arr = {};
          this.stickers[Face[face]] = arr;
        }
        arr[index] = this.color;
        let zyzh=Math.floor(index/9);
        let yyzh=Math.floor((index%9)/3);
        let xyzh=Math.floor((index%9)%3);
        let temp=0
        switch(face){
            case Face.U:temp=3*zyzh+xyzh;break;
            case Face.R:temp=9+3*(2-yyzh)+2-zyzh;break;
            case Face.F:temp=9*2+3*(2-yyzh)+xyzh;break;
            case Face.D:temp=9*3+3*(2-zyzh)+xyzh;break;
            case Face.L:temp=9*4+3*(2-yyzh)+zyzh;break;
            case Face.B:temp=9*5+3*(2-yyzh)+2-xyzh;break;
        }
        this.initState[temp]=this.color;
        
        //this.world.cube.stick(index, face, this.color);
        //this.initState=this.world.cube.serialize();
        this.world.cube.restore(this.initState);
        //console.log(face,index,this.initState,this.color,xyzh,yyzh,zyzh,temp);
    }


    setcubeyzh():void{
        if(this.isColorMode==true) return;
        this.isColorMode=true;
        this.isPlayerMode=false;
        this.yzhcubeState=this.world.cube.serialize();
        this.initState=this.yzhcubeStatec;
        //console.log(this.initState);
        this.world.cube.restore(this.initState);
        this.viewport.resize(this.width, this.height - this.size * 5);
        this.world.controller.taps.push((index: number, face: number) => {
            this.stick(index, face);
        });
    }

    clyzh():void{
        const yzhstate="????U????????R????????F????????D????????L????????B????";
        this.initState=yzhstate.split("");
        this.world.cube.restore(this.initState);
    }

    clallyzh():void{
        this.viewport.resize(this.width, this.height - this.size * 3.5);
        this.world.controller.taps=[];
        this.isColorMode=false;
    }


    isProjection: boolean = false;

    project(): void {
        let curState: string[] = [];
        curState = this.world.cube.serialize();
        this.project_graph(curState);
    }

    project_graph(curState: string[] ): void {
        let index: number = 0;
        this.color_plane = [];

        console.log(curState);

        //initialize with space --- 9 * 12
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 12; col++) {
                this.color_plane[row*12 + col] = 'LZJ';
            }
        }

        //Face "up"
        for (let row = 0; row < 3; row++) {
            for (let col = 3; col < 6; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        //Face "right"
        for (let row = 3; row < 6; row++) {
            for (let col = 6; col < 9; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        //Face "front"
        for (let row = 3; row < 6; row++) {
            for (let col = 3; col < 6; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        //Face "down"
        for (let row = 6; row < 9; row++) {
            for (let col = 3; col < 6; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        //Face "left"
        for (let row = 3; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        //Face "behind"
        for (let row = 3; row < 6; row++) {
            for (let col = 9; col < 12; col++) {
                this.color_plane[row*12 + col] = curState[index++];
            }
        }

        console.log(this.color_plane);

        this.isProjection = true;
    }

}
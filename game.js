(function (global) {
    "use strict";
    // Class ------------------------------------------------
    function Game() { }

    // Header -----------------------------------------------
    global.Game = Game;
    global.Game.initGame = initGame;

    // ------------------------------------------------------
    let COL = 8;
    let vm;
    let state = {}
    let init_state = {
        map: [0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, -1, 1, 0, 0, 0,
            0, 0, 0, 1, -1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ],
        mode: 0,
        turn: 1,
        revision: 0,
        selected: {
            name: "",
            value: 0
        }
    };

    Vue.component('stone', {
        props: ['stone'],
        data: function () {
            return {
                width: 500 / 8
            }
        },
        computed: {
            calcX: function () {
                return (this.width * this.stone.x);
            },
            calcY: function () {
                return (this.width * this.stone.y);
            },
            stateClass: function () {
                switch (this.stone.state) {
                    case 1:
                        return "white";
                        break;
                    case -1:
                        return "black";
                        break;
                    default:
                        return "";
                        break;
                }
            }
        },
        methods: {
            Select: function () {
                mouseClick(this.stone.id);
            }
          },
        template: `
        <g
            @click="Select"
        >
          <rect 
            :x="calcX" 
            :y="calcY" 
            :width="width" 
            :height="width"
            class="cell"
            />
          <circle 
            :r="width/2.6" 
            :cx="(this.width/2)+calcX" 
            :cy="(this.width/2)+calcY"
            v-bind:class="stateClass" 
            />
        </g>
        `
    });

    function initGame() {
        vm = new Vue({
            el: "#app",
            data: {
                stones: [],
            }
        });
        let key=0;
        for(let x=0;x<8;x++){
          for(let y=0;y<8;y++){
            let stone={
              id:key,
              x:x,
              y:y,
              state:1,
              };
            vm.stones.push(stone);
            key++;
          }
        }

        state = init_state;
        render(state);
    }

    function mouseClick(selected) {
        if (Ai.canPut(state.map, selected, state.turn) === true) {
            state.map = Ai.putMap(state.map, selected, state.turn);
            state.turn = -1 * state.turn;
            state.revision += 1;
            render(state);

            setTimeout(function () {
                let _number = Ai.thinkAI(state.map, state.turn, 6)[0];
                state.map = Ai.putMap(state.map, _number, state.turn);
                state.turn = -1 * state.turn;
                state.revision += 1;
                render(state);
            }, 1000);

        }
    }

    function render(state){
        let stones=[];
        for (let i = 0; i < state.map.length; i++) {
            let x = (i % COL) | 0;
            let y = (i / COL) | 0;
            let stone={
              id:i,
              x:x,
              y:y,
              state:state.map[i],
              };
              stones.push(stone);
        }
        vm.stones=stones;
    }
})((this || 0).self || global);
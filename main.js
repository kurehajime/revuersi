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
        turn: 1,
        winner:null,
    };

    Vue.component('stone', {
        props: ['stone'],
        data: function () {
            return {
                width: 500 / COL
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
                        return "black";
                        break;
                    case -1:
                        return "white";
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
            v-bind:class="[stateClass]"
            class="stone"
            />
        <circle 
            :r="width/5" 
            :cx="(this.width/2)+calcX" 
            :cy="(this.width/2)+calcY"
            v-bind:class="{canPut:this.stone.canPut}"
            class="mark"
            />
        </g>
        `
    });

    function initGame() {
        vm = new Vue({
            el: "#app",
            data: {
                stones: [],
                turn:1,
                white_score:0,
                black_score:0,
                wait:false,
                winner:null,
            }
        });
        

        state = JSON.parse(JSON.stringify(init_state));
        render(state);
    }

    function mouseClick(selected) {
        if(state.winner!=null){
            state = JSON.parse(JSON.stringify(init_state));
            render(state);
            return;
        }
        if(state.turn==-1){
            return;
        }
        if (Ai.canPut(state.map, selected, state.turn) === false) {
            return;
        }
        state.map = Ai.putMap(state.map, selected, state.turn);
        state.turn = -1 * state.turn;
        state.winner = checkWinner();//勝敗チェック
        render(state);

        if(state.winner==null){
            setTimeout(function () {
                while(true){
                    if(Ai.canPutPlayer(state.map, state.turn)){
                        let _number = Ai.thinkAI(state.map, state.turn, 6)[0];
                        state.map = Ai.putMap(state.map, _number, state.turn);
                    }
                    state.turn = -1 * state.turn;    
                    state.winner = checkWinner();//勝敗チェック
                    render(state);
                    if(state.winner!=null || Ai.canPutPlayer(state.map, state.turn)){
                        return;
                    }
                    state.turn = -1 * state.turn;    
                }
            }, 1000);
        }
    }

    function checkWinner(map){
        if(!Ai.canPutAll(state.map)){
            return Ai.calcWinner(state.map);
        }
        return null;
    }

    function render(state){
        let stones=[];
        let white=0;
        let black=0;
        for (let i = 0; i < state.map.length; i++) {
            let x = (i % COL) | 0;
            let y = (i / COL) | 0;
            let canPut=Ai.canPut(state.map, i, state.turn) && state.turn==1;
            let stone={
              id:i,
              x:x,
              y:y,
              state:state.map[i],
              canPut:canPut,
              };
              stones.push(stone);
            if(state.map[i]==1){
                black++;
            }
            if(state.map[i]==-1){
                white++;
            }
        }
        vm.stones=stones;
        vm.turn=state.turn==1?"Black":"White"
        vm.white_score=('00' + white).slice(-2);
        vm.black_score=('00' + black).slice(-2);
        vm.wait=(state.turn==-1&&state.winner==null);
        switch (state.winner) {
            case 0:
                vm.winner="Draw Game...";
                break;
            case 1:
                vm.winner="Black wins!";
                break;
            case -1:
                vm.winner="White wins!";
                break;
            default:
                vm.winner="";
                break;
        }
    }
})((this || 0).self || global);
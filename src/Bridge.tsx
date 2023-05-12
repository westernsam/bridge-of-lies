import {useState} from "react";
import {CircleStatus, GameState, Step} from "./Step";
import AnimatedNumber from "animated-number-react";

interface BridgeProps {
    truths: string[]
    lies: string[]
    title: string
}
export const Bridge = ({truths, lies, title}: BridgeProps) => {

    const [money, setMoney] = useState<number>(0)
    const [liesSteppedOn, setLiesSteppedOn] = useState<number>(0)
    const [gamestate, setGamestate] = useState<GameState>('playing')

    const [rowStatus, setState] = useState<CircleStatus[][]>([
        ['start'],
        ['not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['safety', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'safety'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed'],
        ['end']
    ])

    const [truthPath,] = useState<boolean[][]>(getTruthPath());

    function createStep(x: number, y: number, text: string, isALie: boolean) {
        return Step({
            gamestate,
            isALie,
            question: text,
            status: rowStatus,
            onLie,
            onTruth,
            x,
            y
        });
    }

    const onLie = (x, y) => {
        setLiesSteppedOn(liesSteppedOn + 1)

        const newRowState = [...rowStatus.map(r => [...r])]
        if (newRowState[x][y] === 'question_revealed') {
            newRowState[x][y] = 'result_revealed'
        }

        setState(newRowState)

        if (liesSteppedOn !== 2) {
            setMoney(money / 2)
        } else {
            setMoney(0)
            setGamestate('lost')
        }
    }

    const onTruth = (row, column) => {
        const newRowState = [...rowStatus.map(r => [...r])]

        if (rowStatus[row][column] === 'question_revealed')
            setMoney(money + 100)

        if (newRowState[row][column] === 'question_revealed') {
            newRowState[row][column] = 'result_revealed'
        }

        if (row === 9) {
            setGamestate('won')
        } else {


            function setIfPresent(x, y) {
                if (x > 0 && x < newRowState.length && y >= 0 && y < newRowState[x].length && newRowState[x][y] === 'not_yet_revealed')
                    newRowState[x][y] = 'question_revealed'
            }

            function columnOffset(row1: number) {
                return row1 > 5 ? -1 : 0;
            }

            setIfPresent(row - 1, column - 1 + (row - 1 < 5 ? 0 : 1))
            setIfPresent(row - 1, column + (row - 1 < 5 ? 0 : 1))
            setIfPresent(row, column - 1)
            setIfPresent(row, column + 1)
            setIfPresent(row + 1, column + columnOffset(row + 1))
            setIfPresent(row + 1, column + 1 + columnOffset(row + 1))
        }
        setState(newRowState)
    }

    function buildBridge(path: boolean[][], truths: string[], lies: string[]) {
        let truth = -1
        let lie = -1

        return path.map((row, rowIndex) => {
            return row.map((col, colIndex) => {
                let text;

                if (rowIndex === 0) text = 'start'
                else if (rowIndex === 5 && colIndex === 0) text = 'safety'
                else if (rowIndex === 5 && colIndex === 5) text = 'safety'
                else if (rowIndex === 10) text = 'end'
                else text = col ? truths[++truth] : lies[++lie]

                return createStep(rowIndex, colIndex, text, !col);
            })
        })
    }

    function getTruthPath() {

        var truths = 22
        var lies = 10

        function leftOrRight(row, curr, max) {
            if (row < 5) return (curr > max) ? 0 : Math.random() > 0.5 ? 0 : 1
            else if (curr > max) return -1
            else return (curr < 1) ? 0 : Math.random() > 0.5 ? 0 : -1
        }

        var currentCol = leftOrRight(0, 0, 1)

        function truthOrLieRow(row, numColumns) {
            const all = [...Array(numColumns).keys()]
            const truthY = currentCol;
            all.splice(truthY, 1)

            const restOfElements = all.map(c => {
                if (row === 9) {
                    lies--
                    return false
                } else if (lies === 1) {
                    truths--
                    return true
                } else if (truths <= 10 - row) {
                    lies--
                    return false
                } else {
                    let rand = Math.random() > 0.4;
                    if (rand) {
                        truths--
                    } else {
                        lies--
                    }
                    return rand
                }

            });

            truths--
            restOfElements.splice(truthY, 0, true)

            currentCol = currentCol + leftOrRight(row, currentCol, numColumns - 1)

            return restOfElements
        }

        return [
            [true],
            truthOrLieRow(1, 2),
            truthOrLieRow(2, 3),
            truthOrLieRow(3, 4),
            truthOrLieRow(4, 5),
            [false, ...truthOrLieRow(5, 4), false],
            truthOrLieRow(6, 5),
            truthOrLieRow(7, 4),
            truthOrLieRow(8, 3),
            truthOrLieRow(9, 2),
            [true]
        ];
    }


    const bridge = buildBridge(truthPath, truths, lies)


    function showWinLoss() {
        switch (gamestate) {
            case 'won' :
                return <h1>You win !!</h1>
            case 'lost' :
                return <h1>You lose !</h1>
            default:
                return null
        }
    }

    return (
        <div className="App">
            <div>
                <h1>Bridge of lies: {title}</h1>
                {showWinLoss()}
            </div>
            <div className="circle money">
                <h2><AnimatedNumber
                    value={money}
                    formatValue={v => `£ ${Number(v).toFixed(2)}`}
                    duration={500}
                /></h2>
            </div>

            {
                bridge.map((value, index) => <div className="row" key={`row-${index}`}> {value} </div>)
            }


        </div>
    );
}

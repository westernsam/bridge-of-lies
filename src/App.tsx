import './App.css';
import {useState} from "react";

interface CircleProps {
    isALie: boolean
    question: string
    status: CircleStatus[][]
    onTruth: (row, column) => void;
    onLie: (row, column) => void;
    x: number
    y: number
}

type CircleStatus = 'start' | 'not_yet_revealed' | 'question_revealed' | 'result_revealed' | 'safety' | 'end'
type CircleColour = 'not-opened' | 'a-truth' | 'a-lie' | 'a-question'

const defaultTruths = [
    'Edinborough',
    'Durham',
    'Berick-upon-tweed',
    'Sheffield',
    'York',
    'Darlington',
    'Leeds',
    'Bristol Parkway',
    'Stirling',
    'Haymarket',
    'Derby',
    'Newcastle',
    'Morpeth',
    'Dundee',

    'Montrose',
    'Dunbar',
    'Chesterfield',
    'Wakefield Westgate',
    'North Alterton',
    'Totness',
    'Almouth',
    'Stonehaven',
]
const defaultLies = [
    'Buxton',
    'Ipswich',
    'Cardiff',
    'Burnley',
    'Hartlepool',
    'Corby',
    'Whitby',
    'Yeovil',
    'Harrogate',
    'Crediton',
]

const Step = ({isALie, question, status, onTruth, onLie, x, y}: CircleProps) => {
    function getText() {
        switch(status[x][y]) {
            case 'start': return 'start'
            case 'end': return 'end'
            case 'safety': return 'safety'
            case 'question_revealed': return question
            case 'result_revealed': return question
            default: return '?'
        }
    }
    function getColour(): CircleColour {
        switch(status[x][y]) {
            case 'result_revealed': return isALie ? 'a-lie' : 'a-truth'
            case 'question_revealed': return 'a-question'
            default: return 'not-opened'
        }
    }
    const clickStep = () => {
        switch (status[x][y]) {
            case 'start': {
                onTruth(x, y)
                break;
            }
            case 'question_revealed': {
                isALie ? onLie(x, y) : onTruth(x, y)
                break;
            }
        }
    }

    return <div key={`cell-${x}-${y}`} className={`circle ${getColour()}`} onClick={clickStep}><p
        className="text">{getText()}</p></div>
}

interface BridgeProps {
    truths: string[]
    lies: string[]
    title: string
}
const Bridge = ({truths, lies, title}: BridgeProps) => {

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

    const [truthPath, ] = useState<boolean[][]>(getTruthPath());

    function createStep(x: number, y: number, text: string, isALie: boolean) {
        return Step({
            isALie: isALie,
            question: text,
            status: rowStatus,
            onLie: (x, y) => {
                const newRowState = [...rowStatus.map(r => [...r])]
                if (newRowState[x][y] === 'question_revealed' ) {
                    newRowState[x][y] = 'result_revealed'
                }

                setState(newRowState)
            },
            onTruth: revealNeighboursOf,
            x,
            y
        });
    }

    const revealNeighboursOf = (row, column) => {
        const newRowState = [...rowStatus.map(r => [...r])]

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
        if (newRowState[row][column] === 'question_revealed' ) {
            newRowState[row][column] = 'result_revealed'
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
                else if (rowIndex === 5 && colIndex ===0 ) text = 'safety'
                else if (rowIndex === 5 && colIndex ===5 ) text = 'safety'
                else if (rowIndex === 10 ) text = 'end'
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
                }
                else if (lies === 1) {
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


    return (
        <div className="App">
            <h1>Bridge of lies: {title}</h1>
            {
                bridge.map((value, index) => <div className="row" key={`row-${index}`}> {value} </div>)
            }
        </div>
    );
}

function App() {
    const params = new URLSearchParams(window.location.search) // id=123
    const truthhex = params.get('truths')
    const lieshex = params.get('lies')
    const titlehex = params.get('title')

    const truths = !truthhex ? defaultTruths : atob(truthhex).toLocaleString().split(",");
    const lies = !lieshex ? defaultLies : atob(lieshex).toLocaleString().split(",");
    const title = !titlehex ? 'Stops on the route from Penzance to Aberdeen' : atob(titlehex).toLocaleString()

    return Bridge({truths, lies, title})

}

export default App;

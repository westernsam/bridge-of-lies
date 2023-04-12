import './App.css';
import {useEffect, useState} from "react";

interface CircleProps {
    isALie: boolean
    question: string
    status?: CircleStatus
    onTruth: () => void;
    onLie: () => void;
}

type CircleStatus = 'start' | 'not_yet_revealed' | 'question_revealed' | 'result_revealed' | 'safety' | 'end'
type CircleColour = 'not-opened' | 'a-truth' | 'a-lie' | 'a-question'

interface CircleState {
    status: CircleStatus
    colour: CircleColour
    text: string
}

const Step = ({isALie, question, status, onTruth, onLie}: CircleProps) => {
    function getText() {
        switch(status) {
            case 'start': return 'start'
            case 'end': return 'end'
            case 'safety': return 'safety'
            default: return '?'
        }
    }

    const [state, setState] = useState<CircleState>({
        status: status ?? 'not_yet_revealed',
        colour: 'not-opened',
        text: getText()
    })

    useEffect(() => {
        switch (status) {
            case 'question_revealed': {
                setState({status: 'question_revealed', text: question, colour: 'a-question'})
            }
        }
    }, [status])

    const clickStep = () => {
        switch (state.status) {
            case 'start': {
                setState({status: 'result_revealed', text: question, colour: 'a-question'})
                onTruth()
                break;
            }
            case 'question_revealed': {
                isALie ? onLie() : onTruth()
                setState({status: 'result_revealed', text: question, colour: isALie ? 'a-lie' : 'a-truth'})
                break;
            }
        }
    }

    return <div key={question} className={`circle ${state.colour}`} onClick={clickStep}><p
        className="text">{state.text}</p></div>
}

function buildBridge(revealNeighboursOf: (index) => () => void, rowStatus: CircleStatus[][], truths: string[], lies: string[]) {

    function createStep(x: number, y: number, text: string, isALie: boolean) {
        return Step({
            isALie: isALie,
            question: text,
            status: rowStatus[x][y],
            onLie: () => { },
            onTruth: revealNeighboursOf([x, y])
        });
    }

    return [
        [
            createStep(0, 0, 'start', false)
        ],
        [
            createStep(1, 0, 'mo salah', false),
            createStep(1, 1, 'billy sharp', false),
        ],
        [
            createStep(2, 0, 'andy robertson', false),
            createStep(2, 1, 'virgil van dyke', false),
            createStep(2, 2, 'lionel messi', false),
        ],
        [
            createStep(3, 0, 'divok origi', false),
            createStep(3, 1, 'Rhiad marez', false),
            createStep(3, 2, 'Harry Kane', false),
            createStep(3, 3, 'Joe Gomez', false),
        ],
        [
            createStep(4, 0, 'divok origi', false),
            createStep(4, 1, 'divok origi', false),
            createStep(4, 2, 'Rhiad marez', false),
            createStep(4, 3, 'Harry Kane', false),
            createStep(4, 4, 'Harry Kane', false),
        ],
        [
            createStep(5, 0, 'safety', false),
            createStep(5, 1, 'divok origi', false),
            createStep(5, 2, 'Rhiad marez', false),
            createStep(5, 3, 'Harry Kane', false),
            createStep(5, 4, 'Harry Kane', false),
            createStep(5, 5, 'safety', false),
        ],
        [
            createStep(6, 0, 'divok origi', false),
            createStep(6, 1, 'divok origi', false),
            createStep(6, 2, 'Rhiad marez', false),
            createStep(6, 3, 'Harry Kane', false),
            createStep(6, 4, 'Harry Kane', false),
        ],
        [
            createStep(7, 0, 'Rhiad marez', false),
            createStep(7, 1, 'Rhiad marez', false),
            createStep(7, 2, 'Harry Kane', false),
            createStep(7, 3, 'Harry Kane', false),
        ],
        [
            createStep(8, 0, 'Rhiad marez', false),
            createStep(8, 1, 'Harry Kane', false),
            createStep(8, 2, 'Harry Kane', false),
        ],
        [
             createStep(9, 0, 'Harry Kane', false),
            createStep(9, 1, 'Harry Kane', false),
        ],
        [
            createStep(10, 0, 'end', false)
        ],
    ];
}

function App() {
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

    const revealNeighboursOf = index => () => {
        const [row, column] = index

        function setIfPresent(x, y) {
            if (x > 0 && x < rowStatus.length && y >= 0 && y < rowStatus[x].length && rowStatus[x][y] == 'not_yet_revealed')
                rowStatus[x][y] = 'question_revealed'
        }

        function columnOffset(row1: number) {
            return row1 > 5 ? -1 : 0;
        }

        setIfPresent(row - 1, column-1 +  (row - 1 < 5 ? 0 : 1))
        setIfPresent(row - 1, column +  (row - 1 < 5 ? 0 : 1) )
        setIfPresent(row, column - 1)
        setIfPresent(row, column + 1)
        setIfPresent(row + 1, column + columnOffset(row+1))
        setIfPresent(row + 1, column + 1 + columnOffset(row+1))

        setState(rowStatus)
    }
    const bridge = buildBridge(revealNeighboursOf, rowStatus, [], []);

    return (
        <div className="App">
            <h1>Bridge of lies: current Liverpool players</h1>
            {bridge.map((value, index) => <div className="row" key={`row-${index}`}> {value} </div>)}
        </div>
    );
}

export default App;

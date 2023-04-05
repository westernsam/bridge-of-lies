import './App.css';
import {useEffect, useState} from "react";

interface CircleProps {
    isALie: boolean
    question: string
    status?: CircleStatus
    onTruth: () => void;
    onLie: () => void;
}

type CircleStatus = 'start' | 'not_yet_revealed' | 'question_revealed' | 'result_revealed'
type CircleColour = 'not-opened' | 'a-truth' | 'a-lie' | 'a-question'

interface CircleState {
    status: CircleStatus
    colour: CircleColour
    text: string
}

const Circle = ({isALie, question, status, onTruth, onLie}: CircleProps) => {
    const [state, setState] = useState<CircleState>({
        status: status ?? 'not_yet_revealed',
        colour: 'not-opened',
        text: status === 'start' ? 'start' : '?'
    })

    useEffect(() => {
        switch (status) {
            case 'question_revealed': {
                setState({status: 'question_revealed', text: question, colour: 'a-question'})
            }
        }
    }, [status])

    const clickCircle = () => {
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

    return <div key={question} className={`circle ${state.colour}`} onClick={clickCircle}><p
        className="text">{state.text}</p></div>
}

function buildBridge(revealNeighboursOf: (index) => () => void, rowStatus: CircleStatus[][], truths: string[], lies: string[]) {

    function createStep(x: number, y: number, text: string, isALie: boolean) {
        return Circle({
            isALie: isALie,
            question: text,
            status: rowStatus[x][y],
            onLie: () => {
            },
            onTruth: revealNeighboursOf([x, y])
        });
    }

    return [
        [
            createStep(0, 0, 'start', false)
        ],
        [
            createStep(1, 0, 'mo salah', false),
            createStep(1, 1, 'billy sharp', true),
        ],
        [
            createStep(2, 0, 'andy robertson', false),
            createStep(2, 1, 'virgil van dyke', false),
            createStep(2, 2, 'lionel messi', true),
        ],
        [
            createStep(3, 0, 'divok origi', false),
            createStep(3, 1, 'Rhiad marez', true),
            createStep(3, 2, 'Harry Kane', true),
            createStep(3, 3, 'Joe Gomez', false),
        ]
    ];
}

function App() {
    const [rowStatus, setState] = useState<CircleStatus[][]>([
        ['start'],
        ['not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed']
    ])

    const revealNeighboursOf = index => () => {
        const [row, column] = index

        function setIfPresent(x, y) {
            if (x > 0 && x < rowStatus.length && y >= 0 && y < rowStatus[x].length)
                rowStatus[x][y] = 'question_revealed'
        }

        setIfPresent(row - 1, column)
        setIfPresent(row - 1, column + 1)
        setIfPresent(row, column - 1)
        setIfPresent(row, column + 1)
        setIfPresent(row + 1, column)
        setIfPresent(row + 1, column + 1)

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

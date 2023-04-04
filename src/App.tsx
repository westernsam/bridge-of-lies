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

    useEffect(() =>  {
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
                isALie ? onLie() :  onTruth()
                setState({status: 'result_revealed', text: question, colour: isALie ? 'a-lie' : 'a-truth'})
                break;
            }
        }
    }

    return <div className={`circle ${state.colour}`} onClick={clickCircle}><p className="text">{state.text}</p></div>
}

function App() {
    const [rowStatus, setState] = useState<CircleStatus[][]>( [
        ['not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed'],
        ['not_yet_revealed', 'not_yet_revealed', 'not_yet_revealed',  'not_yet_revealed' ]
    ])

    const start = [
        Circle({
            isALie: false, question: "start", status: 'start', onLie: () => {}, onTruth: () => {
                rowStatus[0][0] = 'question_revealed'
                rowStatus[0][1] = 'question_revealed'
                setState(rowStatus)
            }
        })
    ]

    const firstRow = [
        Circle({
            isALie: false,
            question: "mo salah",
            status: rowStatus[0][0],
            onLie: () => {},
            onTruth: () => {
                rowStatus[1][0] = 'question_revealed'
                rowStatus[1][1] = 'question_revealed'
                setState(rowStatus)
            }
        }),
        Circle({
            isALie: true,
            question: "billy sharp",
            status: rowStatus[0][1],
            onLie: () => {},
            onTruth: () => {
                rowStatus[1][1] = 'question_revealed'
                rowStatus[1][2] = 'question_revealed'
                setState(rowStatus)

            }
        })]

    const secondRow = [
        Circle({
            isALie: false,
            question: "andy robertson",
            status: rowStatus[1][0],
            onLie: () => {},
            onTruth: () => {}
        }),
        Circle({
            isALie: false,
            question: "virgil van dyke",
            status: rowStatus[1][1],
            onLie: () => {},
            onTruth: () => {
                rowStatus[1][0] = 'question_revealed'
                rowStatus[1][2] = 'question_revealed'
                setState(rowStatus)
            }
        }),
        Circle({
            isALie: true,
            question: "lionel messi",
            status: rowStatus[1][2],
            onLie: () => {},
            onTruth: () => {}
        })]

    const thirdRow = [
        Circle({
            isALie: false,
            question: "",
            status: rowStatus[2][0],
            onLie: () => {},
            onTruth: () => {}
        }),
        Circle({
            isALie: false,
            question: "virgil van dyke",
            status: rowStatus[2][1],
            onLie: () => {},
            onTruth: () => { }
        }),
        Circle({
            isALie: true,
            question: "lionel messi",
            onLie: () => {},
            status: rowStatus[2][2],
            onTruth: () => {}
        }),
        Circle({
            isALie: true,
            question: "lionel messi",
            onLie: () => {},
            status: rowStatus[2][3],
            onTruth: () => {}
        })
    ]

    return (
        <div className="App">
            <h1>Bridge of lies: current Liverpool players</h1>
            <div className="row">
                {start}
            </div>
            <div className="row">
                {firstRow}
            </div>
            <div className="row">
                {secondRow}
            </div>
            <div className="row">
                {thirdRow}
            </div>
        </div>
    );
}

export default App;

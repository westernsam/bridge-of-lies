interface CircleProps {
    isALie: boolean
    question: string
    status: CircleStatus[][]
    onTruth: (row, column) => void;
    onLie: (row, column) => void;
    x: number
    y: number
    gamestate: GameState
}

export type GameState = 'playing' | 'won' | 'lost'

export type CircleStatus = 'start' | 'not_yet_revealed' | 'question_revealed' | 'result_revealed' | 'safety' | 'end'
export type CircleColour = 'not-opened' | 'a-truth' | 'a-lie' | 'a-question' | 'a-lie-reveal' | 'a-truth-reveal'

export const Step = ({isALie, question, status, onTruth, onLie, x, y, gamestate}: CircleProps) => {
    function getText() {
        switch (status[x][y]) {
            case 'start':
                return 'start'
            case 'end':
                return 'end'
            case 'safety':
                return 'safety'
            case 'question_revealed':
                return question
            case 'result_revealed':
                return question
            default:
                return '?'
        }
    }

    function getColour(): CircleColour {
        switch (status[x][y]) {
            case 'result_revealed':
                return isALie ? 'a-lie' : 'a-truth'
            case 'question_revealed':
                if (gamestate === 'playing') return 'a-question'
                else return isALie ? 'a-lie-reveal' : 'a-truth-reveal'
            default:
                return 'not-opened'
        }
    }

    const clickStep = () => {
        if (gamestate !== 'playing') return
        else {
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
    }

    return <div key={`cell-${x}-${y}`} className={`circle ${getColour()}`} onClick={clickStep}><p
        className="text">{getText()}</p></div>
}

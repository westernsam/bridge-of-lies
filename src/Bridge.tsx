import {useEffect, useState} from "react";
import {CircleStatus, GameState, Step} from "./Step";
import AnimatedNumber from "animated-number-react";
import {useTimer} from 'react-timer-hook';
import {CopyToClipboard} from 'react-copy-to-clipboard';

interface BridgeProps {
    truths: string[]
    lies: string[]
    title: string
}

interface Link {
    id: string;
    shortUrl: string
    title: string
    slashtag: string
}

export const Bridge = ({truths, lies, title}: BridgeProps) => {
    const [popular, setPopular] = useState<Link[]>([])
    const [copied, setCopied] = useState<boolean>(false)

    useEffect(() => {
            const options = {
                method: 'GET',
                headers: {accept: 'application/json', apikey: 'f13772a8abbf4e7082c424d647c3c1c4'}
            };

            fetch('https://api.rebrandly.com/v1/links?orderBy=clicks&orderDir=desc&limit=10', options)
                .then(response => response.json())
                .then(response => setPopular(response))
                .catch(err => console.error(err));
        },
        []
    )

    const {
        seconds,
        isRunning,
        resume,
        pause,
        restart,
    } = useTimer({expiryTimestamp: new Date(), autoStart: false, onExpire: () => setGamestate("lost")});

    const [money, setMoney] = useState<number>(0)
    const [liesSteppedOn, setLiesSteppedOn] = useState<number>(0)
    const [gamestate, setGamestate] = useState<GameState>('not_started')

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
            if (!isRunning) resume()
        }

        setState(newRowState)

        if (liesSteppedOn !== 2) {
            setMoney(money / 2)
        } else {
            setMoney(0)
            setGamestate('lost')
            pause()
        }
    }

    const onTruth = (row, column) => {
        if (row === 0) {
            const now = new Date()
            now.setTime(now.getTime() + 59 * 1000)
            restart(now)
            setGamestate('playing')
        }
        const newRowState = [...rowStatus.map(r => [...r])]

        if (rowStatus[row][column] === 'question_revealed') {
            if (!isRunning) resume()
            setMoney(money + 100)
        }

        if (newRowState[row][column] === 'question_revealed') {
            newRowState[row][column] = 'result_revealed'
        }

        if (newRowState[row][column] === 'safety_opened') {
            pause()
            newRowState[row][column] = 'safety_used'
            const revealedCoordinates = rowStatus.flatMap((row, x) => row.flatMap((c, y) => c === 'question_revealed' ? [[x, y]] : []));
            const revealedLies = revealedCoordinates.filter(coords => !truthPath[coords[0]][coords[1]])
            const lieCoordinates = revealedLies[Math.floor(Math.random() * revealedLies.length)]
            if (lieCoordinates)
                newRowState[lieCoordinates[0]][lieCoordinates[1]] = 'safety_revealed'

        } else {
            if (row === 9) {
                setGamestate('won')
                pause()
            } else {
                function setIfPresent(x, y) {
                    if (x > 0 && x < newRowState.length && y >= 0 && y < newRowState[x].length) {
                        if (newRowState[x][y] === 'not_yet_revealed')
                            newRowState[x][y] = 'question_revealed'

                        if (newRowState[x][y] === 'safety') {
                            newRowState[x][y] = 'safety_opened'
                        }
                    }
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
        }
        setState(newRowState)
    }

    function buildBridge(path: boolean[][], truths: string[], lies: string[]) {
        let truth = -1
        let lie = -1

        return path.map((row, rowIndex) => {
            return row.map((isATruth, colIndex) => {
                let text;

                if (rowIndex === 0) text = 'start'
                else if (rowIndex === 5 && colIndex === 0) text = 'safety'
                else if (rowIndex === 5 && colIndex === 5) text = 'safety'
                else if (rowIndex === 10) text = 'end'
                else text = isATruth ? truths[++truth] : lies[++lie]

                return createStep(rowIndex, colIndex, text, !isATruth);
            })
        })
    }

    function getTruthPath() {

        var truths = 22
        var lies = 10

        type PathDirection = -1 | 0 | 1

        function leftOrRight(row, curr, max): PathDirection {
            switch (row) {
                case 1 :
                case 2 :
                case 3 :
                    return Math.random() > 0.5 ? 0 : 1
                case 4 :
                    //special case
                    switch (curr) {
                        case 0: return 1
                        case 4: return 0
                        default: return Math.random() > 0.5 ? 0 : 1
                    }

                default:
                    return (curr === 0) ? 0 : (curr >= max) ? -1 : Math.random() > 0.5 ? 0 : -1
            }
        }

        var currentCol = 0

        function truthOrLieRow(row, numColumns, indexBase = 0) {
            currentCol = currentCol + leftOrRight(row, currentCol, numColumns - 1)
            if(!(currentCol >= 0 && currentCol < numColumns)) throw "error c=" + currentCol + " r=" + row + "numColumns=" + numColumns

            const all = [...Array(numColumns).keys()].map(i => i + indexBase)
            const truthY = currentCol;
            all.splice(truthY, 1)

            const restOfElements = all.map(c => {
                if (row === 1) {
                    lies--
                    return false
                } else if (row === 9) {
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

            return restOfElements
        }

        let newVar = [
            [true],
            truthOrLieRow(1, 2),
            truthOrLieRow(2, 3),
            truthOrLieRow(3, 4),
            truthOrLieRow(4, 5),
            [false, ...truthOrLieRow(5, 4, 1), false],
            truthOrLieRow(6, 5),
            truthOrLieRow(7, 4),
            truthOrLieRow(8, 3),
            truthOrLieRow(9, 2),
            [true]
        ];
        return newVar;
    }


    const bridge = buildBridge(truthPath, truths, lies)

    function getShareText(truthPath: boolean[][]) {
        //⭕🔴✅🟢◯


        function symbolFor(x: number, y: number) {
            const rs = rowStatus[x][y]
            if (rs === 'not_yet_revealed') return '◯'
            else if (rs === 'question_revealed' || rs === 'safety_revealed') return !truthPath[x][y] ? '⭕' : '🟢'
            else if (rs === 'result_revealed') return !truthPath[x][y] ? '🔴' : '✅'
            else return '◯'
        }

        const bridge =
`
           ◯
        ${symbolFor(1, 0)} ${symbolFor(1, 1)}
      ${symbolFor(2, 0)} ${symbolFor(2, 1)} ${symbolFor(2, 2)}
    ${symbolFor(3, 0)} ${symbolFor(3, 1)} ${symbolFor(3, 2)} ${symbolFor(3, 3)}   
  ${symbolFor(4, 0)} ${symbolFor(4, 1)} ${symbolFor(4, 2)} ${symbolFor(4, 3)} ${symbolFor(4, 4)}    
◯ ${symbolFor(5, 1)} ${symbolFor(5, 2)} ${symbolFor(5, 3)} ${symbolFor(5, 4)} ◯
  ${symbolFor(6, 0)} ${symbolFor(6, 1)} ${symbolFor(6, 2)} ${symbolFor(6, 3)} ${symbolFor(6, 4)} 
    ${symbolFor(7, 0)} ${symbolFor(7, 1)} ${symbolFor(7, 2)} ${symbolFor(7, 3)}                
      ${symbolFor(8, 0)} ${symbolFor(8, 1)} ${symbolFor(8, 2)}
        ${symbolFor(9, 0)} ${symbolFor(9, 1)}
           ◯       
`;
        return `I won £${money}! with ${seconds} seconds to spare on the bridge:\n${title}\n${bridge}`
    }

    return (
        <div className="App">
            <div className="links">
                <div className="box-value">
                    <h2>Popular</h2>
                    <ul className="no-bullets">
                        {
                            popular.map(link => <li key={link.id}><a
                                href={`https://${link.shortUrl}`}>{link.slashtag}</a></li>)
                        }
                    </ul>
                </div>
            </div>
            <div
                className={` money ${gamestate === "playing" || gamestate === 'not_started' ? null : (gamestate === "won") ? 'you-won' : 'you-lost'}`}>
                <div className="box-value"><p>{title}</p></div>
                <div className="box-value"><h2
                    className={gamestate === 'playing' && seconds <= 10 ? 'last-10-seconds' : ''}>{seconds}</h2></div>
                <div className="box-value"><h2><AnimatedNumber
                    value={money}
                    formatValue={v => `£ ${Number(v).toFixed(2)}`}
                    duration={500}
                />
                </h2>
                    {gamestate === 'won' &&
                        <div>
                        <CopyToClipboard text={getShareText(truthPath)} onCopy={() => setCopied(true)}>
                            <button className="button1">Share</button>

                        </CopyToClipboard>
                        { copied ? <span>copied</span> : null }
                        </div>
                    }

                </div>

            </div>

            <div className="bottom">
            {

                bridge.map((value, index) => <div className="row" key={`row-${index}`}> {value} </div>)
            }
            </div>
        </div>
    );
}

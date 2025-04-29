import './App.css';
import {Bridge} from "./Bridge";


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


function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

function App() {
    const params = new URLSearchParams(window.location.search) // id=123
    const truthhex = params.get('truths')
    const lieshex = params.get('lies')
    const titlehex = params.get('title')

    const truths = !truthhex ? defaultTruths :b64_to_utf8(truthhex).split(",");
    const lies = !lieshex ? defaultLies : b64_to_utf8(lieshex).split(",");
    const title = !titlehex ? 'Stops on the route from Penzance to Aberdeen' : b64_to_utf8(titlehex)
    document.title = title;

    return <Bridge truths={truths} lies={lies} title={title}/>

}

export default App;

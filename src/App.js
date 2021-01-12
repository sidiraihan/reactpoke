/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import './index.css';
import { ReactComponent as ArrowIcon } from './icons/arrow.svg';
import { ReactComponent as HomeIcon } from './icons/ic_home_24px.svg';
import { ReactComponent as CollectionIcon } from './icons/ic_bookmark_24px.svg';


//used
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { gql, useQuery } from '@apollo/client';
import useImageColor from 'use-image-color'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  Link,
  useHistory
} from "react-router-dom";
import Modal from 'react-modal';
import BounceLoader from "react-spinners/BounceLoader";
import { useForm } from 'react-hook-form'
import React, { useState, useEffect } from 'react';


const API_pokemon = new ApolloClient({
  uri: 'https://graphql-pokeapi.vercel.app/api/graphql',
  cache: new InMemoryCache()
});
const base_img = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'
const base_color = 'cyan'


const override = css`
  display: block;
  margin: 0 auto;
  position: relative;
`;

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(6 6 6 / 75%)'
  },
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#333',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '1em',
    outline: 'none',
    padding: '2em',
    border: 'none'
  }
};


Modal.setAppElement('#root')

function App() {

  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [catching, setCatching] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pokemon, setPokemon] = useState(false);

  const [currentStorage, SyncWithLocalStorage] = useState(localStorage || {});
  const eventListenerFun = e => {
    SyncWithLocalStorage({ ...localStorage }); //<----spread it which will cause refrence to change
  };
  useEffect(() => {
    window.addEventListener("storage", eventListenerFun);

    return () => window.removeEventListener("storage", eventListenerFun);
  }, []);

  const setModalIsOpenToTrue =()=>{
    setModalIsOpen(true)
  }
  
  const setModalIsOpenToFalse =()=>{
      setModalIsOpen(false)
      setCatching(false)
  }
  const setLoadingToggle =()=>{
    setLoading(!loading)
  }

  const setCatchingToggle =()=>{
    setCatching(!catching)
  }



  

  
  return (
    <React.Fragment>
    <Router>
        <Switch>
          <Route path="/pokemon/:slug">
            <TopBackBtn leftIcon={<ArrowIcon />}/>
            <ApolloProvider client={API_pokemon}>
              <Pokedetail/>
            </ApolloProvider>
            <Footer/>
          </Route>
          <Route path="/saved">
            <Saved/>
            <BottomNavBar></BottomNavBar>
          </Route>
          <Route path="/">
             <ApolloProvider client={API_pokemon}>
                <Pokelist></Pokelist>
             </ApolloProvider>
             <BottomNavBar></BottomNavBar>
             <Footer/>
          </Route>
        </Switch>
    </Router>
    </React.Fragment>
  );

  function Pokelist() {
    setLoading(true)
    const GET_POKEMONS = gql`
    query pokemons($limit: Int, $offset: Int) {
      pokemons(limit: $limit, offset: $offset) {
        results {
          url
          name
          image
          id
        }
      }
    }
  `;
  
    const gqlVariables = {
      limit: 25,
      offset: 1,
    }
  
    const { loading, error, data } = useQuery(GET_POKEMONS, {
      variables: gqlVariables,
    });
  
  if (loading) return <div css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height:50vh;
          }`}><BounceLoader color={base_color} loading={loading} css={override} size={50} /></div>;
  if (error) return `Error! ${error.message}`;
  
  return <PokelistHtml value={data} />;
  }
  
  
  function PokelistHtml(props){
    useEffect(() => {
      setLoading(false)
    });
    return(
      <div>
        <p css={css`text-align: center;font-size: 12px;font-weight: bold;`}>Pokepedia</p>
        {props.value.pokemons.results.map((pokemon, key) => (
          <Link key={pokemon.id} to={`/pokemon/${pokemon.name}`}>
          <div css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
          padding: 0;
          margin: 1em;
          background-color: #3333;
          border-radius: 0.5em;
          &:hover {
            color: ${base_color};
          }`} 
            //onClick={(e) => Pokedetail(pokemon.name)}
            
            >
            <img css={css`
            width: 100px;
            height: 100px;
            `} src={pokemon.image} />
            <div css={css`
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: 0;
            font-size: 12px;
            `}>
              <h2 css={css`
              font-size: 16px;
              font-weight: bold;
              margin:0;
            `}>{pokemon.name}</h2>
             <OwnedHtml value={pokemon.id} />
            </div>
          </div>
          </Link>
        ))}
      </div>
    )
  }

  function OwnedHtml(props){
    const arr = JSON.parse(localStorage.getItem('saved')) || []
 
    if (arr != ''){

      const res_saved = Array.from(arr.reduce(
        (m, {pokemon, qty}) => m.set(pokemon.id, (m.get(pokemon.id) || 0) + qty), new Map
      ), ([id, total]) => ({id, total}));

      return (
        <div>
        <p key={props.value}> 
        {res_saved.map((saved, key) => (
          saved.id == props.value ? 'owned '+saved.total : ''
        ))}
        </p>
        </div>
      )
    }else{
      return ('')
    }
    
  }
  
  
  function Pokedetail() {
    let { slug } = useParams();
    setLoading(true)

    const GET_DETAIL_POKEMON = gql`
    query pokemon($name: String!) {
      pokemon(name: $name) {
        id
        name
        sprites {
          front_default
        }
        moves {
          move {
            name
          }
        }
        types {
          type {
            name
          }
        }
      }
    }
  `;
  
    const gqlVariables = {
      name: slug,
    }
  
    const { loading, error, data } = useQuery(GET_DETAIL_POKEMON, {
      variables: gqlVariables,
    });
  
    if (loading) return <div css={css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height:50vh;
    }`}><BounceLoader color={base_color} loading={loading} css={override} size={50} /></div>;
    
    if (error) return `Error! ${error.message}`;
  
    return <PokedetailHtml value={data} />;
  }
  
  function PokedetailHtml(props) {
    const { colors } = useImageColor(props.value.pokemon.sprites.front_default, { cors: true, color: 5, windowSize: 25 })
    useEffect(() => {
      setLoading(false)
    });

    return(
      <div>
          <div css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          padding: 0;
          margin: 0.3em;
          background-color: ${colors};
          border-top-left-radius: 0.5em;
          border-top-right-radius: 0.5em;
          border-bottom-left-radius: 0.5em;
          border-bottom-right-radius: 0.5em;
          &:hover {
            color: ${base_color};
          }`} 
            key={props.value.pokemon.id}>
            <img css={css`
            flex: 1;
            width: 100%;
            `} src={props.value.pokemon.sprites.front_default} />
            <div css={css`
            display: flex;
            flex-direction: row;
            flex: 1;
            padding: 0;
            font-size: 12px;
            width: 100%;
            justify-content: space-around;
            align-items: center;
            color: white;
            border-bottom-left-radius: 0.5em;
            border-bottom-right-radius: 0.5em;
            `}>
              <h2 css={css`
              font-size: 28px;
              font-weight: bold;
            `}>{props.value.pokemon.name}</h2>
              <OwnedHtml value={props.value.pokemon.id} />
            </div>
          </div>
  
          <div css={css`
            display: flex;
            flex-direction: row-reverse;
            flex: 1;
            padding: 0;
            font-size: 12px;
            width: 100%;
            justify-content: space-around;
            align-items: flex-start;
            background-color: #333;
            color: white;
            border-bottom-left-radius: 0.5em;
            border-bottom-right-radius: 0.5em;
            margin-bottom: 15vh;
            `}>
              <div css={css` flex:1; align-items: center; display: flex; flex-direction: column; `}> 
                <h2>Types</h2>
                {props.value.pokemon.types.map((pokemon, key) => (
                  <p key={key}>{pokemon.type.name}</p>
                ))}
              </div>
  
              <div css={css` flex:1; align-items: center; display: flex; flex-direction: column; `}> 
                <h2>Moves</h2>
                {props.value.pokemon.moves.map((pokemon, key) => (
                  <p key={key}>{pokemon.move.name}</p>
                ))}            
                </div>
          </div>
                  
          <CatchPokemon pokemon={props.value.pokemon} bg={colors}/>
          
          <Modal style={customStyles} isOpen={modalIsOpen}>
                <SetNickName/>
            </Modal>
      </div>
    )
  }
  
  function CatchPokemon(props) {

    if(catching) {
      return <div css={css`
      position: fixed;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: ${props.bg};
      width: 100%;
      border-radius: 0.5em;
    `}>
    <p css={css`
      background-color: transparent;
      width: 100%;
      margin: 1em;
      padding: 1em;
      text-align: center;
      border-radius: 0.5em;
      color: black;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    `}><BounceLoader color={base_color} loading={true} css={override} size={65} />
    </p> 
    </div>
    }else{
      return <div onClick={(e) => CatchController(props.pokemon)} css={css`
      position: fixed;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      width: 100%;
    `}>
    <p css={css`
      background-color: ${props.bg};
      width: 100%;
      margin: 1em;
      padding: 1em;
      text-align: center;
      border-radius: 0.5em;
      color: white;
      font-weight: bold;
    `}>Catch {props.pokemon.name}</p> 
    </div>
    }

  }
  
  function CatchController(props) {
    
    console.log("trying to catch" +props.name)

      setSubmitted(false)
      setCatching(true)
      setLoading(true)

    setTimeout(() => {  
      
      var dice = Math.random() > 0.5 ? 1 : 2  
      console.log(dice)
      if(dice === 1) {
        setPokemon(props)
        console.log("catch success")
        setModalIsOpenToTrue()
        setCatching(false)
        setLoading(false)
      }else{
        //alert("not lucky enough try again and see")
        console.log("catch failed")
        setModalIsOpenToTrue()
        setCatching(true)
        setLoading(false)
      }
  
    }, 1000);

   
     
    


  
  }
  

  function SetNickName() {
    console.log("pokemon name for localstorage " +pokemon.name)

    const { register, handleSubmit, errors } = useForm()
    const onSubmit = data_nickname => { 
      AddPokemonToLocalStorage({ id: Date.now(), qty: 1, pokemon: {id: pokemon.id, name: pokemon.name}, nickname: data_nickname.nickname })
      setSubmitted(true)
    }

    if (submitted) {
      return (
        <div>
          <h2>{pokemon.name} saved!</h2>
          <input onClick={setModalIsOpenToFalse} css={css`
              background-color: mediumseagreen;
              padding: 1em;
              border-radius: 0.5em;
              border: none;
              color: white;
              font-weight: bold;
              margin-top: 1em;
              width: 100%;
              `}
              type="submit" value="Got it" />
        </div>
      );
    } else if (catching){
      return (
        <div>
          <h2>Got nothing :(</h2>
          <input onClick={setModalIsOpenToFalse} css={css`
              background-color: mediumseagreen;
              padding: 1em;
              border-radius: 0.5em;
              border: none;
              color: white;
              font-weight: bold;
              margin-top: 1em;
              width: 100%;
              `}
              type="submit" value="I will try again" />
        </div>
      );
    }else{  
      return (
        <div>
          <h2>You got {pokemon.name}!</h2>
       <form css={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              `}
              onSubmit={handleSubmit(onSubmit)}>
          <input css={css`
              background-color: black;
              padding: 1em;
              border-radius: 1em;
              border: none;
              margin-bottom: 1em;
              color: white;
              width: 100%;
              outline: none;
              `}
              name="nickname" placeholder="Give pokemon nickname"  ref={register({ required: true})} />
          {errors.nickname && <span> Nickname field is required</span>}
          <input css={css`
              background-color: mediumseagreen;
              padding: 1em;
              border-radius: 0.5em;
              border: none;
              color: white;
              font-weight: bold;
              margin-top: 1em;
              width:100%;
              `}
              type="submit" value="Save"/>
        </form>
    
        </div>
    
      );
    }
 
  }

  function AddPokemonToLocalStorage(note) {
    const arr = JSON.parse(localStorage.getItem('saved')) || [];
    arr.push(note);
    localStorage.setItem('saved', JSON.stringify(arr));
    window.dispatchEvent(new Event("storage"));
  }



  function Saved() {
    const saved_pokemon = JSON.parse(localStorage.getItem('saved')) || [];
    if (saved_pokemon == ''){
      return(
      <div css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height:100vh;
      }`}>
          <p>You don't have any pokemons here </p>
          <Link to={`/`} css={css`
              background-color: mediumseagreen;
              border-radius: 0.5em;
              border: none;
              color: white;
              font-weight: bold;
              margin-top: 1em;
              width: 50%;
              border-radius: 1em;
              margin-left: 5em;
              margin-right: 5em;
              text-align: center;
              `}>
          <div>
            <p>Catch Pokemon</p>
          </div>
          </Link>
      </div>
        
      )
    }else{
    return( 
       <div>
         <p css={css`text-align: center;font-size: 12px;font-weight: bold;`}>My Pokemon</p>
          {saved_pokemon.reverse().map((saved, key) => (
          
          <div 
          css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
          background-color: #3333;
          }`}
            
            key={saved.id}>
              <Link to={`/pokemon/${saved.pokemon.name}`}>
              <div css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-around;
          padding: 0;
          margin: 1em;
          border-radius: 0.5em;
          &:hover {
            color: ${base_color};
          }`}>
              <img css={css`
              width: 100px;
              height: 100px;
            `} src={base_img+saved.pokemon.id+".png"} />
            <div css={css`
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: 0;
            font-size: 12px;
            `}>
              <h2 css={css`
              font-size: 16px;
              font-weight: bold;
            `}>{saved.pokemon.name}</h2>
                          <p>{saved.nickname}</p>
            </div>
              </div>
              </Link>
            <div onClick={() => deleteSave(saved)} css={css`
              display: flex;
              flex: 1;
              justify-content: flex-end;
              margin-right: 2em;
            `}> 
              <span>🗑️ </span>
            </div>
           
          </div>
         
        ))}
      </div>
    ); 
        }
  }

  function deleteSave(data){
    console.log("del" +data.id)
    const confirm = window.confirm("remove "+data.nickname+"?");
    
    if (confirm === true){
      let arr = JSON.parse(localStorage.getItem('saved'))
      let filtered = arr.filter(item => item.id !== data.id);
      localStorage.setItem('saved', JSON.stringify(filtered));
      window.dispatchEvent(new Event("storage"));
      console.log("deleted")
    }else{
      console.log("nothing")
    }

  }

  function BottomNavBar() {
    return (
      <nav css={css`
        position: fixed;
        bottom: 0;
        background-color: black;
        color:#cacaca;
        width:100%;
        display: flex;
        justify-content: space-around;
        font-size:9px;
        padding-top: 1vh;
        padding-bottom: 1vh;
      `} >
        <BottomNavbarItem icon={<HomeIcon/>} name="Home" path="/"></BottomNavbarItem>
        <BottomNavbarItem icon={<CollectionIcon/>} name="Saved" path="/saved"></BottomNavbarItem>    
      </nav>
    );
  }
  
  function BottomNavbarItem(props) {
    const history = useHistory();
    const currentUrl = window.location.pathname;

    function handleOnClick(){
      history.push(props.path);
 
    }

    return (
        <ul onClick={handleOnClick} css={css`
        display: flex;
        justify-content: space-around;
        flex:1;
        align-items: center;
        flex-direction: column;
        color: ${currentUrl == props.path ? base_color : '#cacaca'}
      `}><span css={css`${currentUrl == props.path ? 'filter: invert(1%) sepia(100%) saturate(641%) hue-rotate(102deg) brightness(104%) contrast(101%);' : '#cacaca'}`}>{props.icon}</span>{props.name}</ul>
    );
  }
  
  function TopBackBtn(props) {
    const history = useHistory();
    const handleOnClick = () => history.goBack();
    return (
      <div onClick={handleOnClick} css={css`
      display: flex;
      justify-content: space-around;
      flex:1;
      align-items: flex-start;
      background-color: transparent;
      position: fixed;
      padding: 1em;
    `}><span className="icon-button">{props.leftIcon}</span></div>
  );
  }
  
  
  function Footer() {
    if( !loading){
      return (
        <div css={css`display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: black;
        border-top-right-radius: 1em;
        border-top-left-radius: 1em;
        padding: 1em;
        position: relative;
        bottom: 0;
        font-size: 12px;`}>
          <p>Made by <a css={css`color:${base_color}`}href="https://rsha.netlify.app">Raihan Sidi Harinda</a></p>
          
        </div>
      );
    }else{
      return ''
    }
  
  }

}









export default App;

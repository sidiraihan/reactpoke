import './index.css';
import { ReactComponent as BellIcon } from './icons/bell.svg';
import { ReactComponent as MessengerIcon } from './icons/messenger.svg';
import { ReactComponent as CaretIcon } from './icons/caret.svg';
import { ReactComponent as PlusIcon } from './icons/plus.svg';
import { ReactComponent as CogIcon } from './icons/cog.svg';
import { ReactComponent as ChevronIcon } from './icons/chevron.svg';
import { ReactComponent as ArrowIcon } from './icons/arrow.svg';
import { ReactComponent as BoltIcon } from './icons/bolt.svg';
import axios from 'axios';
import { useAPI } from 'react-api-hooks';
import { Button } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// import Carousel from '@brainhubeu/react-carousel';
// import '@brainhubeu/react-carousel/lib/style.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useForm } from 'react-hook-form'


import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

const API_URL = 'http://jsonplaceholder.typicode.com';
const API_corona = 'https://covid19.mathdro.id/api/countries/indonesia';



function App() {

  return (
    <React.Fragment>

    <Router>
      <Navbar>
        <NavItemSimple><Link to="/">Home</Link></NavItemSimple> 
        <NavItemSimple><Link to="/about">About</Link></NavItemSimple>
        <NavItemSimple><Link to="/login">Login</Link></NavItemSimple>
        <NavItem icon={<PlusIcon />} />
        <NavItem icon={<BellIcon />} />
        <NavItem icon={<MessengerIcon />} />
        <NavItem icon={<CaretIcon />}>
          <DropdownMenu></DropdownMenu>
        </NavItem>
      </Navbar>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/">
             <BannerItem></BannerItem>
             <InfoCorona></InfoCorona>
          </Route>
        </Switch>
    
    </Router>
    </React.Fragment>
  );
}
function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Login() {
  const { register, handleSubmit, watch, errors } = useForm()
  const onSubmit = data_login => { console.log(data_login) }

  console.log(watch('email')) // watch input value by passing the name of it
  console.log(watch('password'))
  return (
    <div>
      <h2>login</h2>
   <form onSubmit={handleSubmit(onSubmit)}>
      <input name="email" placeholder="email"  ref={register({ required: true })} />
      
      <input type="password" name="password" placeholder="password" ref={register({ required: true })} />
      {errors.email && <span> Email field is required</span>}
      {errors.password && <span> Password field is required</span>}

      <input type="submit" />
    </form>
    </div>

  );
}

function Navbar(props) {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">{props.children}</ul>
    </nav>
  );
}

function Banner(props) {
  return (
    <div class={props.tag}>{props.children}</div>
  );
}

function Info(props) {
  const url = `${API_URL}/posts/`;
  // const [result, setData] = useState({ posts: [] });
  let ayam = 'ayam'
  // axios.get(url).then(response => response.data)
  //   .then((data) => {
  //     setData('hello')
  //     console.log(data)
  //     //json = data
  //   })


  const axiosConfig = {
    method: 'GET',
    // data: { foo: 'bar' },
    // params: { id: '14' }
  };
  const { response, error, isLoading } = useAPI(url, axiosConfig);

  if (error) {
    return <p>error</p>
  }

  if (isLoading) {
    return <p>loading...</p>
  }

  return (
    <div>
      <ul>
        {response.data.map(item => (
          <li key={item.id}>
            {item.title > 500 &&
               <a syle="color:lightgreen;" href={item.id}>{item.title}</a>
            }

          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCorona(props) {
  const url = `${API_corona}`;
  const axiosConfig = {
    method: 'GET',
    // data: { foo: 'bar' },
    // params: { id: '14' }
  };
  const { response, error, isLoading } = useAPI(url, axiosConfig);

  if (error) {
    return <p>error</p>
  }

  if (isLoading) {
    return <p>loading...</p>
  }

  if (response) {
    console.log(response.data);
  }

  const yesterdayConfirmed = 6759
  

  return (
    <div class="flex-box">
      <div>
        <p>Terkonfirmasi</p>
        <p>{response.data.confirmed.value}</p>

        {response.data.confirmed.value > yesterdayConfirmed && <YesterdayItemIncrease value={response.data.confirmed.value - yesterdayConfirmed} /> }
        {response.data.confirmed.value < yesterdayConfirmed && <YesterdayItemDecrease value={response.data.confirmed.value - yesterdayConfirmed} /> }

       <Button variant="contained" color="primary">Hello World</Button>
       </div>

       <div>
        <p>Sembuh</p>
       <p>{response.data.recovered.value}</p>
       <Button variant="contained" color="primary">Hello World</Button>
       </div>

       <div>
        <p>Meninggal</p>
       <p>{response.data.deaths.value}</p>
       <Button variant="contained" color="primary">Hello World</Button>
       </div>


    </div>
  );
}

function YesterdayItemIncrease(props){
  return(
    <p class="lightgreen">+{props.value} since yesterday</p>
  )
}

function YesterdayItemDecrease(props){
  return(
    <p class="lightred">{props.value} since yesterday</p>
  )
}

function BannerItem(props) {
  var settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3
  };
  return (
    <div >

      <Slider {...settings}>
        <div>
         <img src="https://pbs.twimg.com/media/EV3Y5JfUMAAXnDx?format=jpg&name=small"></img>
        </div>
        <div>
        <img src="https://pbs.twimg.com/media/EV3Y5JfUMAAXnDx?format=jpg&name=small"></img>
        </div>
        <div>
        <img src="https://pbs.twimg.com/media/EV3Y5JfUMAAXnDx?format=jpg&name=small"></img>
        </div>
        <div>
        <img src="https://pbs.twimg.com/media/EV3Y5JfUMAAXnDx?format=jpg&name=small"></img>
        </div>
        <div>
        <img src="https://pbs.twimg.com/media/EV3Y5JfUMAAXnDx?format=jpg&name=small"></img>
        </div>
        
      </Slider>
    </div>
  );

}
function NavItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="nav-item">
      <a href={props.href} className="icon-button" onClick={() => setOpen(!open)}>
        {props.icon}
      </a>

      {open && props.children}
    </li>
  );
}

function NavItemSimple(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="nav-item">
      {props.children}
    </li>
  );
}

function DropdownMenu() {
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight)
  }, [])

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>

      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem>My Profile</DropdownItem>
          <DropdownItem
            leftIcon={<CogIcon />}
            rightIcon={<ChevronIcon />}
            goToMenu="settings">
            Settings
          </DropdownItem>
          <DropdownItem
            leftIcon="🦧"
            rightIcon={<ChevronIcon />}
            goToMenu="animals">
            Animals
          </DropdownItem>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'settings'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<ArrowIcon />}>
            <h2>My Tutorial</h2>
          </DropdownItem>
          <DropdownItem leftIcon={<BoltIcon />}>HTML</DropdownItem>
          <DropdownItem leftIcon={<BoltIcon />}>CSS</DropdownItem>
          <DropdownItem leftIcon={<BoltIcon />}>JavaScript</DropdownItem>
          <DropdownItem leftIcon={<BoltIcon />}>Awesome!</DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'animals'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<ArrowIcon />}>
            <h2>Animals</h2>
          </DropdownItem>
          <DropdownItem leftIcon="🦘">Kangaroo</DropdownItem>
          <DropdownItem leftIcon="🐸">Frog</DropdownItem>
          <DropdownItem leftIcon="🦋">Horse?</DropdownItem>
          <DropdownItem leftIcon="🦔">Hedgehog</DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default App;

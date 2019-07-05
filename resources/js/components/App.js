import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Segment } from 'semantic-ui-react';
import MediaPermissionHander from '../handlers/MediaPermissionHander';
import Pusher from 'pusher-js';
import Peer from 'simple-peer';

export default class App extends Component {
	
	constructor(props){
		super(props);
		
		this.state = {
			isMediaAvailable: false,
			toUserId: null
		};
		
		this.mediaPermissionHander = new MediaPermissionHander();
		this.stream = null;
		this.peers = {};
		this.setPusher = this.setPusher.bind(this);
		this.startPeer = this.startPeer.bind(this);
		this.callUser = this.callUser.bind(this);
		
		this.setPusher();
	}
	
	componentWillMount(){
		this.mediaPermissionHander.getUserPermissions()
			.then((stream) => {
				this.setState({isMediaAvailable: true});
				this.stream = stream;
				try{
					this.from.srcObject = stream;
				}	
				catch(error){
					this.from.srcObject = URL.createObject(stream);
				}
				this.from.play();
			});
	}
	
	setPusher(){
		//console.log('calling setPusher');
		//Pusher.logToConsole = true;
		this.pusher = new Pusher('2b99ea80122390530f7e', {
			authEndpoint: "/VideoChat/public/pusher/auth",
			cluster: 'ap2',
			forceTLS: true,
			auth: {
				params: this.props.userId,
				headers:{
					'X-CSRF-Token': this.props.token
				}
			}
		});
		
		this.channel = this.pusher.subscribe('presence-video-channel');
		this.channel.bind(`client-signal-${this.props.userId}`,(signal) => {
			let peer = this.peers[signal.userId];
			
			//for incoming calls
			if(peer === undefined){
				this.setState({toUserId: signal.userId});
				peer = this.startPeer(signal.userId, false);
			}
			
			peer.signal(signal.data);
		});
	}
	
	startPeer(id, initiator = true){
		const peer = new Peer({
			initiator: initiator,
			stream: this.stream,
			trickle: false
		});
		
		peer.on('signal',(data) => {
			console.log(data);
			this.channel.trigger(`client-signal-${id}`,{
				type: 'signal',
				userId: this.props.userId,
				data: data
			});
		});
		
		peer.on('stream',(stream) => {
			try{
				this.to.srcObject = stream;
			}	
			catch(error){
				this.to.srcObject = URL.createObject(stream);
			}
			this.to.play();
		});
		
		peer.on('close',() => {
			let peer = this.peers[userId];
			if(peer !== undefined){
				peer.destroy();
			}
			
			this.peers[userId] = undefined;
		});
			
		return peer;
	}
	
	callUser(id){
		console.log(`called to ${id}`);
		this.peers[id] = this.startPeer(id);
	}
	
    render() {
		console.log(this.props);
        return (
			<div>
				{[1,2].map((id) => {
					return (id != this.props.userId) ? <button onClick = {() => this.callUser(id)} key = {id}> call to {id}</button> : null;
				})}
				<div className = "video__container">
					<video className = "__from" controls ref = {(ref) => {this.from = ref}}></video>
					<video className = "__to" controls ref = {(ref) => {this.to = ref}}></video>
				</div>
			</div>	
        );
    }
}


if (document.getElementById('app')) {
	const app = document.getElementById('app');
	const userId = app.dataset['userid'];
	const token = document.getElementById('tkn').value;
	//get the csrf token and current user id and put it to the props of the App component
    ReactDOM.render(<App userId = {userId} token = {token}/>, app);
}

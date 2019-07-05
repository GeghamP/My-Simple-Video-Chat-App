<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\User;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }
	
	public function auth(Request $request){
		
		$socket = $request->socket_id;
		$channel = $request->channel_name;
		$options = ['cluster' => 'ap2', 'useTLS' => true, 'encrypted' => true ];
		$pusher = new \Pusher\Pusher('2b99ea80122390530f7e','1f3489fb9829ba8f4e11','814159',$options);
		
		$data = ['name' => Auth::user()->name];
		$key = $pusher->presence_auth($channel, $socket, Auth::user()->id, $data);
		
		return response($key);
	}
	
	public function getUsers(){
		$users = User::all();
		
		return response()->json($users);
	}
}

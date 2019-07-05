@extends('layouts.app')

@section('content')
	<input type = "hidden" id = "tkn" value = {{ csrf_token() }}>
	<div id = "app" data-userid = "{{ Auth::user()->id }}"></div>
@endsection

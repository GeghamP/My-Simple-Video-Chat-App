class MediaPermissionHandler{
	
	getUserPermissions(){
		
		return new Promise((resolve,reject) => {
			
			navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true
			})
			.then((stream) => {
				resolve(stream);
			})
			.catch((error) => {
				throw new Error(`Something gets wrond ${error}`);
			});
		});
	}
}

export default MediaPermissionHandler;
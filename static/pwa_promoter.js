console.log("PWA installer registered.");
let deferredPrompt;
const addBtn = document.querySelector('.pwa-add-button');
if(addBtn){
	addBtn.style.display = 'none';
}
else {
	console.warn("PWA button not found!");
}

let pwa_enabled = true;

if (pwa_enabled){
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
	    navigator.serviceWorker.register('/sw.js').then(function(registration) {
	      // Registration was successful
	      console.log('ServiceWorker registration successful with scope: ', registration.scope);
	    }, function(err) {
	      // registration failed :(
	      console.log('ServiceWorker registration failed: ', err);
	    });
	  });
	}
	else{
		console.log("Service workers not supported!");
	}



	window.addEventListener('beforeinstallprompt', (e) => {
		// Prevent Chrome 67 and earlier from automatically showing the prompt
		e.preventDefault();
		// Stash the event so it can be triggered later.
		deferredPrompt = e;
		// Update UI to notify the user they can add to home screen
		if(addBtn) {
			addBtn.style.display = 'block';
			addBtn.addEventListener('click', (e) => {
				// Analytics
				try{
					sa_event("pwa_clicked");
				}
				catch{} // We don't care
				console.log("User clicked the install button.");
				// hide our user interface that shows our A2HS button
				addBtn.style.display = 'none';
				// Show the prompt
				deferredPrompt.prompt();
				// Wait for the user to respond to the prompt
				deferredPrompt.userChoice.then((choiceResult) => {
					if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the A2HS prompt');
					// Analytics
					try{
						sa_event("pwa_installed");
					}
					catch{} // We don't care
					} else {
					console.log('User dismissed the A2HS prompt');
					// Analytics
					try{
						sa_event("pwa_canceled");
					}
					catch{} // We don't care
					}
					deferredPrompt = null;
				});
			});
		}
	});
}
else{
	console.log("PWA functionality manually disabled.");
}


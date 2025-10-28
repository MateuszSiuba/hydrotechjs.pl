
    // Contact Form Enhancement - wysyłanie formularza z feedback
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            
            // Pokaż stan ładowania
            submitButton.disabled = true;
            submitButton.textContent = 'Wysyłanie...';
            
            // Usuń poprzednie komunikaty
            const oldStatus = contactForm.querySelector('.form-status');
            if (oldStatus) oldStatus.remove();
            
            try {
                const response = await fetch('https://formspree.io/f/xgvweazd', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                const statusDiv = document.createElement('div');
                statusDiv.className = 'form-status';
                
                if (response.ok) {
                    statusDiv.classList.add('success');
                    statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Wiadomość wysłana pomyślnie! Odpowiemy wkrótce.';
                    contactForm.reset();
                } else {
                    statusDiv.classList.add('error');
                    statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Wystąpił błąd. Spróbuj ponownie lub zadzwoń.';
                }
                
                contactForm.appendChild(statusDiv);
                
                // Ukryj komunikat po 5 sekundach
                setTimeout(() => {
                    statusDiv.style.opacity = '0';
                    setTimeout(() => statusDiv.remove(), 300);
                }, 5000);
                
            } catch (error) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Błąd połączenia. Sprawdź internet i spróbuj ponownie.';
                contactForm.appendChild(statusDiv);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

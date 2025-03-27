FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos da aplicação
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Expõe a porta 80
EXPOSE 80 

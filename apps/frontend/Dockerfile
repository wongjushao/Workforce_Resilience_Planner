FROM node:22-alpine

WORKDIR /workspace/apps/frontend

COPY apps/frontend/package.json /workspace/apps/frontend/package.json

RUN npm install

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]

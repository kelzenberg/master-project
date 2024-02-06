# syntax=docker/dockerfile:1-experimental

FROM ubuntu:20.04 as build-simulation

ENV TERM "xterm"
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app
RUN apt-get update -y && apt-get install -y \
  git \
  gfortran \
  python3-dev \
  python3-ase \
  python3-setuptools \
  python3-lxml \
  python3-numpy \
  python3-flask

RUN git clone https://github.com/kmcos/kmcos.git
WORKDIR /app/kmcos
RUN python3 ./setup.py install

COPY packages/simulation/methanation /app/simulations/methanation

WORKDIR /app/simulations/methanation
RUN python3 ./Methanation_simplified_further.py

COPY packages/simulation/start.py /app/simulations/methanation/Methanation_local_smart/

RUN addgroup --system app && adduser --system --group app
USER app

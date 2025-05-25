FROM rust:latest

WORKDIR /app

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim

COPY --from=0 /app/target/release/memory-hog /app/memory-hog

CMD ["/app/memory-hog"]


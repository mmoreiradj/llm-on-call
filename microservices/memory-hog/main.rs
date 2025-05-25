use std::thread;
use std::time::Duration;
use ctrlc;

fn main() {
    let mut vec: Vec<Vec<u8>> = Vec::new();
    let max_memory_mb = 100000;
    let running = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(true));
    let r = running.clone();

    ctrlc::set_handler(move || {
        r.store(false, std::sync::atomic::Ordering::SeqCst);
    }).expect("Error setting Ctrl-C handler");

    while running.load(std::sync::atomic::Ordering::SeqCst) {
        let chunk = vec![0u8; 10 * 1024 * 1024];
        vec.push(chunk);

        let current_memory_mb = vec.len() * 10;
        println!("Allocated {} MB of memory", current_memory_mb);

        if current_memory_mb >= max_memory_mb {
            println!("Reached maximum memory limit of {} MB", max_memory_mb);
            while running.load(std::sync::atomic::Ordering::SeqCst) {
                thread::sleep(Duration::from_secs(1));
            }
            break;
        }

        thread::sleep(Duration::from_millis(100));
    }
}

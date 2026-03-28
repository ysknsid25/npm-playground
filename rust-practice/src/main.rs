use std::{rc::Rc, thread::current};

struct Node {
    data: i32,
    child: Option<Rc<Node>>,
}

fn print_link(start_node: Rc<Node>) {
    let mut current_node = start_node;
    loop {
        println!("Node data: {}", current_node.data);
        if current_node.child.is_none() {
            break;
        }
        current_node = Rc::clone(current_node.child.as_ref().unwrap());
    }
}

fn main() {
    let node3 = Rc::new(Node { data: 3, child: None });
    let node2 = Rc::new(Node { data: 2, child: Some(Rc::clone(&node3)) });
    let node1 = Rc::new(Node { data: 1, child: Some(Rc::clone(&node3)) });

    print_link(node1);
    print_link(node2);
}
